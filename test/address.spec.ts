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
import { Address, Contact } from '@prisma/client';

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

  describe('POST /api/contacts/:contactId/addresses', () => {
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
        .post(`/api/contacts/${testContact.id}/addresses`)
        .set('authorization', 'salah')
        .send({
          street: 'street',
          city: 'city',
          country: 'country',
          province: 'province',
          postal_code: '12345',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create address', async () => {
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

  describe('GET /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if request is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}/addresses/0`)
        .set('authorization', 'test');

      logger.error(response.body.errors);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}/addresses/${testAddress.id}`)
        .set('authorization', 'salah');

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if address is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}/addresses/${testAddress.id + 1}`)
        .set('authorization', 'test');

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get address', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}/addresses/${testAddress.id}`)
        .set('authorization', 'test');

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('street');
      expect(response.body.data.city).toBe('city');
      expect(response.body.data.country).toBe('country');
      expect(response.body.data.province).toBe('province');
      expect(response.body.data.postal_code).toBe('3333');
    });
  });

  describe('PUT /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if request is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id}/addresses/${testAddress.id}`)
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

    it('should be rejected if address is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id}/addresses/${testAddress.id + 1}`)
        .set('authorization', 'test')
        .send({
          street: 'street',
          city: 'city',
          country: 'country',
          province: 'province',
          postal_code: '3333',
        });

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update address', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${testContact.id}/addresses/${testAddress.id}`)
        .set('authorization', 'test')
        .send({
          street: 'street update',
          city: 'city update',
          country: 'country update',
          province: 'province update',
          postal_code: '4444',
        });

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data.street).toBe('street update');
      expect(response.body.data.city).toBe('city update');
      expect(response.body.data.country).toBe('country update');
      expect(response.body.data.province).toBe('province update');
      expect(response.body.data.postal_code).toBe('4444');
    });
  });

  describe('DELETE /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if address is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${testContact.id}/addresses/${testAddress.id + 1}`)
        .set('authorization', 'test');

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to delete address', async () => {
      const testContact = await testService.getContact() as Contact;
      const testAddress = await testService.getAddress() as Address;
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${testContact.id}/addresses/${testAddress.id}`)
        .set('authorization', 'test');

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);

      const addressResult = await testService.getAddress();
      expect(addressResult).toBeNull();
    });
  });

  describe('GET /api/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should be rejected if contact is not found', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id + 1}/addresses`)
        .set('authorization', 'test');

      logger.error(response.body.errors);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}/addresses`)
        .set('authorization', 'salah');

      logger.error(response.body.errors);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get address list', async () => {
      const testContact = await testService.getContact() as Contact;
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${testContact.id}/addresses`)
        .set('authorization', 'test');

      logger.info(response.body.data);
      expect(response.status).toBe(200);
      expect(response.body.data[0].street).toBe('street');
      expect(response.body.data[0].city).toBe('city');
      expect(response.body.data[0].country).toBe('country');
      expect(response.body.data[0].province).toBe('province');
      expect(response.body.data[0].postal_code).toBe('3333');
    });
  });
});