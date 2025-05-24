import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { App } from 'supertest/types';
import { Logger } from 'winston';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { TestModule } from './test.module';
import { TestService } from './test.service';
import { Contact } from '@prisma/client';

describe('UserController', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get(PrismaService);
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('authorization', 'test')
        .send({
          first_name: '',
          last_name: '',
          phone: '',
          email: 'salah',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('authorization', 'salah')
        .send({
          first_name: 'first',
          last_name: 'last',
          phone: '1234',
          email: 'contact@example.com',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create contact', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('authorization', 'test')
        .send({
          first_name: 'first',
          last_name: 'last',
          phone: '1234',
          email: 'contact@example.com',
        });

      logger.info(response.body.data);
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('first');
      expect(response.body.data.last_name).toBe('last');
      expect(response.body.data.email).toBe('contact@example.com');
      expect(response.body.data.phone).toBe('1234');
    });
  });

  describe('GET /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
    });
    it('should be rejected if contact is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id + 1}`)
        .set('authorization', 'test')

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id + 1}`)
        .set('authorization', 'salah')

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get contact', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}`)
        .set('authorization', 'test')

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('test');
      expect(response.body.data.last_name).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.phone).toBe('1234');
    });
  });

  describe('PUT /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
    });
    it('should be rejected if contact is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id + 1}`)
        .set('authorization', 'test')
        .send({
          first_name: 'first',
          last_name: 'last',
          phone: '1234',
          email: 'contact@example.com',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id + 1}`)
        .set('authorization', 'salah')

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if request is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id}`)
        .set('authorization', 'test')
        .send({
          first_name: '',
          last_name: '',
          phone: '',
          email: 'salah',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get contact', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id}`)
        .set('authorization', 'test')
        .send({
          first_name: 'first update',
          last_name: 'last update',
          phone: '5678',
          email: 'update@example.com',
        })

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('first update');
      expect(response.body.data.last_name).toBe('last update');
      expect(response.body.data.email).toBe('update@example.com');
      expect(response.body.data.phone).toBe('5678');
    });
  });

  describe('DELETE /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
    });
    it('should be rejected if contact is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${testContact.id + 1}`)
        .set('authorization', 'test')

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${testContact.id + 1}`)
        .set('authorization', 'salah')

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to delete contact', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${testContact.id}`)
        .set('authorization', 'test')

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });

  describe('GET /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createManyContacts();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/`)
        .set('authorization', 'salah')

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get many contacts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
    });

    it('should be able to search contact by name notfound', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          name: 'wrongs'
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be not found to get many contacts on page 4', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          size: 5,
          page: 4
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to get many contacts on page 2', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          size: 5,
          page: 2
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
    });

    it('should be able to contact by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          name: 'test 9'
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].first_name).toBe('test 9');
      expect(response.body.data[0].last_name).toBe('test 9');
      expect(response.body.data[0].email).toBe('test9@example.com');
      expect(response.body.data[0].phone).toBe('12349');
    });

    it('should be able to contact by email', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          email: 'test9@example.com'
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].first_name).toBe('test 9');
      expect(response.body.data[0].last_name).toBe('test 9');
      expect(response.body.data[0].email).toBe('test9@example.com');
      expect(response.body.data[0].phone).toBe('12349');
    });

    it('should be able to contact by phone', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          phone: '12349'
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].first_name).toBe('test 9');
      expect(response.body.data[0].last_name).toBe('test 9');
      expect(response.body.data[0].email).toBe('test9@example.com');
      expect(response.body.data[0].phone).toBe('12349');
    });

    it('should be able to contact by name, email, and phone', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .query({
          email: 'test9@example.com',
          phone: '12349',
          name: 'test 9'
        })
        .set('authorization', 'test')

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].first_name).toBe('test 9');
      expect(response.body.data[0].last_name).toBe('test 9');
      expect(response.body.data[0].email).toBe('test9@example.com');
      expect(response.body.data[0].phone).toBe('12349');
    });
  });
});