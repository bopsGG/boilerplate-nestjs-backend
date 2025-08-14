import { createMock } from '@golevelup/ts-jest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { AppLoggerService } from '../../common/app-logger';
import { ApprovalStatusEnum } from '../../common/enum';
import { BadRequestExceptionFilter } from '../../common/filters/customException/badRequest.exception';
import { HttpExceptionFilter } from '../../common/filters/customException/custom.exception';
import { PathNotFoundExceptionFilter } from '../../common/filters/customException/pathNotFound.exception';
import { UnknownExceptionFilter } from '../../common/filters/customException/unknown.exception';
import { TemplateResponseTransformerInterceptor } from '../../common/interceptors/template-response';
import { CreateTodoDto } from '../dto';
import { TodoDetail } from '../entities/todo-detail.entity';
import { Todo } from '../entities/todo.entity';

describe('TodoController', () => {
  let app: INestApplication;
  let httpServer: any;
  let todoRepo: Repository<Todo>;
  let todoDetailRepo: Repository<TodoDetail>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalFilters(
      new UnknownExceptionFilter(createMock<AppLoggerService>(), true),
      new HttpExceptionFilter(createMock<AppLoggerService>(), true, true),
      new PathNotFoundExceptionFilter(true),
      new BadRequestExceptionFilter(createMock<AppLoggerService>(), true),
    );

    app.useGlobalInterceptors(
      new TemplateResponseTransformerInterceptor(new Reflector()),
    );

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    httpServer = app.getHttpServer();
    todoRepo = app.get<Repository<Todo>>(getRepositoryToken(Todo));
    todoDetailRepo = app.get<Repository<TodoDetail>>(
      getRepositoryToken(TodoDetail),
    );

    await app.init();
  });

  beforeEach(async () => {
    await todoDetailRepo.delete({});
    await todoRepo.delete({});
  });

  afterAll(async () => {
    await todoDetailRepo.delete({});
    await todoRepo.delete({});
    await app.close();
  });

  describe('/GET todos', () => {
    it('should return empty list if no data', async () => {
      const res = await request(httpServer).get('/todos');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: { code: 'S0200', message: 'Success' },
        data: {
          items: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 20,
            totalPages: 0,
            currentPage: 1,
          },
        },
      });
    });

    it('should return todo list if data exists', async () => {
      await request(httpServer)
        .post('/todos')
        .send({ name: 'a', description: 'b', creatorName: 'c' });

      const res = await request(httpServer).get('/todos');
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0]).toMatchObject({
        name: 'a',
        encryptedName: 'a',
        description: 'b',
        creatorName: 'c',
        status: ApprovalStatusEnum.PENDING,
        isActive: true,
        todoDetails: expect.any(Array),
      });
    });
  });

  describe('/POST todos', () => {
    const validTodo: CreateTodoDto = {
      name: 'a',
      description: 'b',
      creatorName: 'c',
    };

    it('should create and return todo', async () => {
      const res = await request(httpServer).post('/todos').send(validTodo);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: { code: 'S0201', message: 'Created' },
        data: {
          ...validTodo,
          encryptedName: 'a',
          status: ApprovalStatusEnum.PENDING,
          isActive: true,
        },
      });
      expect(res.body.data.id).toEqual(expect.any(String));
      expect(res.body.data.createdAt).toEqual(expect.any(String));
      expect(res.body.data.updatedAt).toEqual(expect.any(String));
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(httpServer)
        .post('/todos')
        .send({ description: 'b', creatorName: 'c' });
      expect(res.status).toBe(400);
      expect(res.body.status.code).toBe('E0400');
      expect(res.body.status.message).toBe('Bad Request');
      expect(res.body.status.meta.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('name should not be empty'),
          }),
          expect.objectContaining({
            message: expect.stringContaining('name must be a string'),
          }),
        ]),
      );
    });
  });
});
