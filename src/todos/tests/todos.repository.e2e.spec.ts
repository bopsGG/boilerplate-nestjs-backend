import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { ApprovalStatusEnum } from '../../common/enum';
import { TodoDetail } from '../entities/todo-detail.entity';
import { Todo } from '../entities/todo.entity';
import { TodoRepository } from '../todos.repository';

describe('TodoRepository', () => {
  let app: INestApplication;
  let todoRepo: TodoRepository;
  let todoRepoToken: Repository<Todo>;
  let todoDetailRepoToken: Repository<TodoDetail>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    todoRepoToken = app.get<Repository<Todo>>(getRepositoryToken(Todo));
    todoDetailRepoToken = app.get<Repository<TodoDetail>>(
      getRepositoryToken(TodoDetail),
    );

    await todoDetailRepoToken.query('TRUNCATE TABLE todo_details CASCADE');
    await todoRepoToken.query('TRUNCATE TABLE todos CASCADE');

    todoRepo = app.get<TodoRepository>(TodoRepository);
  });

  afterEach(async () => {
    await todoDetailRepoToken.query('TRUNCATE TABLE todo_details CASCADE');
    await todoRepoToken.query('TRUNCATE TABLE todos CASCADE');
  });

  afterAll(async () => {
    await todoDetailRepoToken.query('TRUNCATE TABLE todo_details CASCADE');
    await todoRepoToken.query('TRUNCATE TABLE todos CASCADE');
    await app.close();
  });

  describe('repository todo', () => {
    describe('getById', () => {
      it('should return null if todo not found', async () => {
        const result = await todoRepo.getById('non_existing_id');
        expect(result).toBeNull();
      });
    });

    describe('findAll', () => {
      it('should return empty pagination if no data', async () => {
        const options: IPaginationOptions = { limit: 10, page: 1 };
        const result: Pagination<Todo> = await todoRepo.findAll({}, options);
        expect(result).toEqual({
          items: [],
          meta: {
            currentPage: 1,
            itemCount: 0,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
          },
        });
      });
    });

    describe('create and find', () => {
      it('should create a todo and retrieve it', async () => {
        const now = new Date();
        const todo: Todo = {
          id: 'id_test_create',
          name: 'Test Todo',
          encryptedName: 'Test Todo',
          description: 'Description',
          creatorName: 'Tester',
          isActive: true,
          status: ApprovalStatusEnum.PENDING,
          createdAt: now,
          updatedAt: now,
        };

        const created = await todoRepo.create(todo);
        expect(created).toMatchObject(todo);

        const found = await todoRepo.getById('id_test_create');
        expect(found).toMatchObject(todo);

        const options: IPaginationOptions = { limit: 10, page: 1 };
        const paginated = await todoRepo.findAll({}, options);
        expect(paginated.items).toHaveLength(1);
        expect(paginated.items[0]).toMatchObject(todo);
        expect(paginated.meta).toEqual({
          currentPage: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
        });
      });
    });

    describe('delete', () => {
      it('should delete a todo and return null when retrieved', async () => {
        const now = new Date();
        const todo: Todo = {
          id: 'id_test_delete',
          name: 'Todo to delete',
          encryptedName: 'Todo to delete',
          description: 'Desc',
          creatorName: 'Tester',
          isActive: true,
          status: ApprovalStatusEnum.PENDING,
          createdAt: now,
          updatedAt: now,
          todoDetails: undefined,
        };

        await todoRepo.create(todo);
        let found = await todoRepo.getById('id_test_delete');
        expect(found).toEqual(todo);

        const deleted = await todoRepo.delete('id_test_delete');
        expect(deleted).toBeTruthy();

        found = await todoRepo.getById('id_test_delete');
        expect(found).toBeNull();
      });
    });
  });
});
