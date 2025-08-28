import { Injectable } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { DataSource } from 'typeorm';
import { AppLoggerService } from '../common/app-logger/app-logger.service';
import { CustomHttpCodeConstant } from '../common/constant';
import {
  InternalErrorException,
  NotFoundErrorException,
} from '../common/dto/custom-error-type.dto';
import { ApprovalStatusEnum } from '../common/enum';
import { AutoIdService } from '../common/providers/auto-id/auto-id.service';
import { CreateTodoDto, GetListTodoDto, UpdateTodoDto } from './dto';
import { TodoDetail } from './entities/todo-detail.entity';
import { Todo } from './entities/todo.entity';
import { TodoDetailRepository } from './todo-details.repository';
import { TodoRepository } from './todos.repository';

@Injectable()
export class TodoService {
  constructor(
    private readonly autoId: AutoIdService,
    private readonly dataSource: DataSource,
    private readonly logger: AppLoggerService,
    private readonly todoDetailRepo: TodoDetailRepository,
    private readonly todoRepo: TodoRepository,
  ) {
    this.logger.setContext('TodoService');
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const todoId = this.autoId.gen();

        const todo: Todo = {
          ...dto,
          id: todoId,
          encryptedName: dto.name,
          status: ApprovalStatusEnum.PENDING,
          isActive: true,
        };

        const createdTodo = await this.todoRepo.create(todo, manager);

        const detail: TodoDetail = {
          id: this.autoId.gen(),
          todoId,
          name: dto.name,
          isActive: true,
        };

        await this.todoDetailRepo.create(detail, manager);

        return createdTodo;
      });
    } catch (err) {
      throw new InternalErrorException({ message: err.message });
    }
  }

  findAll(query: GetListTodoDto): Promise<Pagination<Todo>> {
    return this.todoRepo.findAll(query, {
      limit: query.limit,
      page: query.page,
    });
  }

  async getById(id: string): Promise<Todo> {
    const todo = await this.todoRepo.getById(id);
    if (!todo) {
      throw new NotFoundErrorException({
        code: CustomHttpCodeConstant.NOTFOUND,
        message: `Todo not found: '${id}'`,
      });
    }

    return todo;
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    await this.getById(id);

    try {
      await this.dataSource.transaction(async (manager) => {
        await this.todoRepo.update(id, <Todo>{ ...dto }, manager);
      });

      return this.todoRepo.getById(id);
    } catch (err) {
      throw new InternalErrorException({ message: err.message });
    }
  }

  async delete(id: string): Promise<Todo> {
    const todo = await this.getById(id);

    return this.dataSource.transaction(async (manager) => {
      const success = await this.todoRepo.delete(id, manager);
      if (!success) {
        throw new InternalErrorException({
          code: `${CustomHttpCodeConstant.UNABLE_DELETE}Todo`,
          message: `Unable to delete todo '${id}'`,
        });
      }

      return todo;
    });
  }
}
