import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AppLoggerService } from '../common/app-logger/app-logger.service';
import { TodoDetail } from './entities/todo-detail.entity';

@Injectable()
export class TodoDetailRepository {
  constructor(
    @InjectRepository(TodoDetail)
    private readonly todoRepo: Repository<TodoDetail>,

    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('TodoDetailRepository');
  }

  async create(
    todoDetail: TodoDetail,
    manager?: EntityManager,
  ): Promise<TodoDetail> {
    this.logger.info('create --> Database: ', JSON.stringify(todoDetail));

    const repo = manager?.getRepository(TodoDetail) ?? this.todoRepo;
    const result = await repo.save(todoDetail);

    this.logger.info('create --> Result: ', JSON.stringify(result));

    return result;
  }
}
