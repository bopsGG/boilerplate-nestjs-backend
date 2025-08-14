import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IPaginationMeta,
  IPaginationOptions,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { DataSource } from 'typeorm';
import { AppLoggerService } from '../../common/app-logger/app-logger.service';
import {
  InternalErrorException,
  NotFoundErrorException,
} from '../../common/dto';
import { ApprovalStatusEnum } from '../../common/enum';
import { AutoIdService } from '../../common/providers/auto-id/auto-id.service';
import { GetListTodoDto } from '../dto';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { TodoDetail } from '../entities/todo-detail.entity';
import { Todo } from '../entities/todo.entity';
import { TodoDetailRepository } from '../todo-details.repository';
import { TodoRepository } from '../todos.repository';
import { TodoService } from '../todos.service';

describe('TodoService', () => {
  let service: TodoService;
  const todoRepositoryMock = createMock<TodoRepository>();
  const todoDetailRepositoryMock = createMock<TodoDetailRepository>();
  const autoIdServiceMock = createMock<AutoIdService>();
  const appLoggerServiceMock = createMock<AppLoggerService>();
  const dataSourceMock = createMock<DataSource>();
  const todoId = 'todo_1';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: TodoRepository, useValue: todoRepositoryMock },
        { provide: TodoDetailRepository, useValue: todoDetailRepositoryMock },
        { provide: AutoIdService, useValue: autoIdServiceMock },
        { provide: AppLoggerService, useValue: appLoggerServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  beforeEach(() => {
    jest.resetAllMocks();

    dataSourceMock.transaction.mockImplementation(async (callback: any) => {
      const manager = {};

      return callback(manager);
    });
  });

  describe('Find todo', () => {
    it('should return todo and pagination', async () => {
      const getTodoParams: GetListTodoDto = {
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
        limit: 5,
        page: 1,
      };
      const todoPagination: IPaginationOptions = { limit: 5, page: 1 };
      const todo: Pagination<Todo, IPaginationMeta> = {
        items: [
          {
            id: todoId,
            name: 'test_title',
            description: 'test_description',
            creatorName: 'test_creator',
            status: ApprovalStatusEnum.PENDING,
            isActive: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          } as Todo,
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 5,
          totalPages: 1,
          currentPage: 1,
        },
      };
      todoRepositoryMock.findAll.mockResolvedValueOnce(todo);

      const result = await service.findAll(getTodoParams);

      expect(todoRepositoryMock.findAll).toBeCalledWith(
        getTodoParams,
        todoPagination,
      );
      expect(result).toEqual(todo);
    });
  });

  describe('Get todo', () => {
    it('should throw NotFoundErrorException if todo not found', async () => {
      todoRepositoryMock.getById.mockResolvedValue(null);
      const promise = service.getById(todoId);

      await expect(promise).rejects.toThrow(NotFoundErrorException);
      await expect(promise).rejects.toHaveProperty(
        'message',
        `Todo not found: '${todoId}'`,
      );
    });

    it('should return todo if found', async () => {
      const expectedTodo: Todo = {
        id: todoId,
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
        status: ApprovalStatusEnum.PENDING,
        isActive: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      todoRepositoryMock.getById.mockResolvedValueOnce(expectedTodo);

      const result = await service.getById(todoId);
      expect(result).toEqual(expectedTodo);
      expect(todoRepositoryMock.getById).toBeCalledWith(todoId);
    });
  });

  describe('Create todo', () => {
    it('should create and return todo', async () => {
      const input: CreateTodoDto = {
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
      };
      const expectedTodo: Todo = {
        id: todoId,
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
        encryptedName: 'test_title',
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      const expectedDetail: TodoDetail = {
        id: expect.any(String),
        todoId,
        name: 'test_title',
        isActive: true,
      };

      autoIdServiceMock.gen
        .mockReturnValueOnce(todoId)
        .mockReturnValueOnce('todo_detail_1');
      todoRepositoryMock.create.mockResolvedValueOnce(expectedTodo);
      todoDetailRepositoryMock.create.mockResolvedValueOnce(expectedDetail);

      const promise = service.create(input);
      await expect(promise).resolves.toEqual(expectedTodo);

      expect(todoRepositoryMock.create).toBeCalledWith(
        expect.objectContaining({
          id: todoId,
          ...input,
          encryptedName: input.name,
        }),
        expect.anything(),
      );
      expect(todoDetailRepositoryMock.create).toBeCalledWith(
        expect.objectContaining({ todoId, name: input.name }),
        expect.anything(),
      );
    });

    it('should throw InternalErrorException on create failure', async () => {
      const input: CreateTodoDto = {
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
      };
      todoRepositoryMock.create.mockRejectedValueOnce(new Error('DB error'));

      const promise = service.create(input);
      await expect(promise).rejects.toThrow(InternalErrorException);
      await expect(promise).rejects.toHaveProperty('message', 'DB error');
    });
  });

  describe('Update todo', () => {
    it('should throw NotFoundErrorException if todo not found', async () => {
      todoRepositoryMock.getById.mockResolvedValue(null);
      const promise = service.update(todoId, { isActive: true });

      await expect(promise).rejects.toThrow(NotFoundErrorException);
      await expect(promise).rejects.toHaveProperty(
        'message',
        `Todo not found: '${todoId}'`,
      );
    });

    it('should update and return todo', async () => {
      const input: UpdateTodoDto = {
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
      };
      const todoToUpdate: Todo = {
        id: todoId,
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
        status: ApprovalStatusEnum.PENDING,
        isActive: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      const updatedTodo: Todo = { ...todoToUpdate, ...input };

      todoRepositoryMock.getById
        .mockResolvedValueOnce(todoToUpdate)
        .mockResolvedValueOnce(updatedTodo);
      todoRepositoryMock.update.mockResolvedValueOnce(true);

      const result = await service.update(todoId, input);
      expect(result).toEqual(updatedTodo);
      expect(todoRepositoryMock.update).toBeCalledWith(
        todoId,
        input,
        expect.anything(),
      );
    });

    it('should throw InternalErrorException if update fails', async () => {
      const input: UpdateTodoDto = {
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
      };
      const todo: Todo = {
        id: todoId,
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      todoRepositoryMock.getById.mockResolvedValueOnce(todo);
      todoRepositoryMock.update.mockRejectedValueOnce(
        new Error('Update failed'),
      );

      const promise = service.update(todoId, input);
      await expect(promise).rejects.toThrow(InternalErrorException);
      await expect(promise).rejects.toHaveProperty('message', 'Update failed');
    });
  });

  describe('Delete todo', () => {
    it('should delete and return the todo', async () => {
      const todo: Todo = {
        id: todoId,
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      todoRepositoryMock.getById.mockResolvedValueOnce(todo);
      todoRepositoryMock.delete.mockResolvedValueOnce(true);

      const promise = service.delete(todo.id);
      await expect(promise).resolves.toEqual(todo);

      expect(todoRepositoryMock.delete).toBeCalledWith(
        todo.id,
        expect.anything(),
      );
    });

    it('should throw InternalErrorException if delete fails', async () => {
      const todo: Todo = {
        id: todoId,
        name: 'test_title',
        description: 'test_description',
        creatorName: 'test_creator',
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };
      todoRepositoryMock.getById.mockResolvedValue(todo);
      todoRepositoryMock.delete.mockResolvedValue(false);

      const promise = service.delete(todo.id);
      await expect(promise).rejects.toThrow(InternalErrorException);
      await expect(promise).rejects.toHaveProperty(
        'message',
        `Unable to delete todo '${todo.id}'`,
      );
    });

    it('should throw NotFoundErrorException if todo not found', async () => {
      todoRepositoryMock.getById.mockResolvedValue(null);

      const promise = service.delete(todoId);
      await expect(promise).rejects.toThrow(NotFoundErrorException);
      await expect(promise).rejects.toHaveProperty(
        'message',
        `Todo not found: '${todoId}'`,
      );
    });
  });
});
