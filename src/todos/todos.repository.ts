import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
import { AppLoggerService } from '../common/app-logger/app-logger.service';
import { addSearchConditions } from '../common/util';
import { GetListTodoDto } from './dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,

    private readonly dataSource: DataSource,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('TodoRepository');
  }

  async create(todo: Todo, manager?: EntityManager): Promise<Todo> {
    this.logger.info('create --> Database: ', JSON.stringify(todo));

    const repo = manager?.getRepository(Todo) ?? this.todoRepo;
    const created = await repo.save(todo);

    this.logger.info('create --> Result: ', JSON.stringify(created));

    return created;
  }

  async findAll(
    getListTodoDto: GetListTodoDto,
    options: IPaginationOptions,
    manager?: EntityManager,
  ): Promise<Pagination<Todo>> {
    this.logger.info(
      'findAll --> Database: ',
      JSON.stringify({ getListTodoDto, options }),
    );

    const {
      keyword,
      status,
      isActive,
      orderBy,
      direction,
      page = 1,
      limit = 10,
    } = getListTodoDto;

    const repo = manager?.getRepository(Todo) ?? this.todoRepo;
    const query = repo
      .createQueryBuilder('todos')
      .leftJoinAndSelect('todos.todoDetails', 'todoDetails');

    if (status) query.andWhere('todos.status =:status', { status });
    if (isActive) query.andWhere('todos.isActive =:isActive', { isActive });

    if (keyword) {
      const keywordToSearch = `%${keyword.trim()}%`;
      const entitiesToSearch = [
        {
          alias: 'todos',
          metadata: this.dataSource.getMetadata(Todo).columns,
          selectColumns: ['name', 'description'],
        },
        {
          alias: 'todoDetails',
          metadata: this.dataSource.getMetadata(Todo).columns,
          selectColumns: ['name'],
        },
      ];

      query.andWhere(
        new Brackets((qb) => {
          for (const { alias, metadata, selectColumns } of entitiesToSearch) {
            addSearchConditions(
              qb,
              alias,
              metadata,
              keywordToSearch,
              selectColumns,
            );
          }
        }),
      );
    }

    if (orderBy && direction) query.orderBy(`todos.${orderBy}`, direction);
    query.skip((page - 1) * limit).take(limit);

    const [items, itemCount] = await query.getManyAndCount();

    const result = {
      items,
      meta: {
        itemCount,
        totalItems: itemCount,
        itemsPerPage: limit,
        totalPages: Math.ceil(itemCount / limit),
        currentPage: page,
      },
    };

    this.logger.info('findAll --> Result: ', JSON.stringify(result));

    return result;
  }

  async getById(id: string, manager?: EntityManager): Promise<Todo> | null {
    this.logger.info('getById --> Database: ', JSON.stringify({ id }));

    const repo = manager?.getRepository(Todo) ?? this.todoRepo;
    const result = await repo.findOneBy({ id });

    this.logger.info('getById --> Result: ', JSON.stringify(result));

    return result;
  }

  async update(
    id: string,
    todo: Todo,
    manager?: EntityManager,
  ): Promise<boolean> {
    this.logger.info('update --> Database: ', JSON.stringify({ id, todo }));

    const repo = manager?.getRepository(Todo) ?? this.todoRepo;
    const result = await repo.update(id, todo);
    const updated = result.affected === 1;

    this.logger.info('update --> Result: ', JSON.stringify(updated));

    return updated;
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    this.logger.info('delete --> Database: ', JSON.stringify({ id }));

    const repo = manager?.getRepository(Todo) ?? this.todoRepo;
    const result = await repo.delete(id);
    const deleted = result.affected === 1;

    this.logger.info('delete --> Result: ', JSON.stringify(deleted));

    return deleted;
  }

  async getMaxIndex(manager?: EntityManager): Promise<number> {
    this.logger.info('getMaxIndex --> Database:', {});

    const repo = manager?.getRepository(Todo) ?? this.todoRepo;
    const result = await repo
      .createQueryBuilder('todos')
      .select('MAX(todos.id)', 'max')
      .getRawOne();

    const maxIndex = result?.max ? Number(result.max) : 0;

    this.logger.info('getMaxIndex --> Result:', maxIndex);

    return maxIndex;
  }
}
