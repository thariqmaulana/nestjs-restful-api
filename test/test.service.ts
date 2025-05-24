import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import { Address, Contact } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('test', 10),
        name: 'test',
        token: 'test',
      },
    });
  }

  async getUser() {
    return this.prismaService.user.findUnique({
      where: {
        username: 'test',
      },
    });
  }

  async deleteContact() {
    await this.prismaService.contact.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createContact() {
    await this.prismaService.contact.create({
      data: {
        first_name: 'test',
        last_name: 'test',
        email: 'test@example.com',
        phone: '1234',
        username: 'test',
      },
    });
  }

  async createManyContacts() {
    for (let i = 1; i <= 15; i++) {
      await this.prismaService.contact.create({
        data: {
          first_name: `test ${i}`,
          last_name: `test ${i}`,
          email: `test${i}@example.com`,
          phone: `1234${i}`,
          username: 'test',
        },
      });
    }
  }

  async getContact(): Promise<Contact | null> {
    return this.prismaService.contact.findFirst({
      where: {
        username: 'test',
      },
    });
  }

  async deleteAddress() {
    await this.prismaService.address.deleteMany({
      where: {
        contact: {
          username: 'test',
        },
      },
    });
  }

  async createAddress() {
    const contact = await this.getContact();

    if (!contact) {
      throw new NotFoundException();
    }

    await this.prismaService.address.create({
      data: {
        contact_id: contact.id,
        street: 'street',
        city: 'city',
        country: 'country',
        province: 'province',
        postal_code: '3333',
      },
    });
  }

  async getAddress(): Promise<Address | null> {
    const contact = await this.getContact();

    if (!contact) {
      throw new NotFoundException();
    }

    return this.prismaService.address.findFirst({
      where: {
        contact_id: contact.id,
      },
    });
  }

  async deleteAll() {
    await this.deleteAddress();
    await this.deleteContact();
    await this.deleteUser();
  }
}
