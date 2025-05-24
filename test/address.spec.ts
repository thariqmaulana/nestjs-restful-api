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

describe('AddressController', () => {
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

  describe('POST /api/contacts/contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if request is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .post(`/api/contacts/${testContact.id}/addresses`)
        .set('authorization', 'test')
        .send({
          street: '',
          city: '',
          country: '',
          province: '',
          postal_code: '',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
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
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .post(`/api/contacts/${testContact.id}/addresses`)
        .set('authorization', 'test')
        .send({
          street: 'street',
          city: 'city',
          country: 'country',
          province: 'province',
          postal_code: '3333',
        });

      logger.info(response.body.data);
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('street');
      expect(response.body.data.city).toBe('city');
      expect(response.body.data.country).toBe('country');
      expect(response.body.data.province).toBe('province');
      expect(response.body.data.postal_code).toBe('3333');
    });
  });
});