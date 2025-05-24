import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { Prisma, User } from '@prisma/client';
import { ContactValidation } from './contact.validation';
import { WebResponse } from '../model/web.model';

@Injectable()
export class ContactService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async checkContactMustExists(username: string, contactId: number) {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: username,
        id: contactId,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact Not Found');
    }

    return contact;
  }

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.info(
      `UserService.update(${JSON.stringify(user.username)} - ${JSON.stringify(request)})`,
    );
    const validatedRequest: CreateContactRequest =
      this.validationService.validate(ContactValidation.CREATE, request);

    const contact = await this.prismaService.contact.create({
      data: {
        ...validatedRequest,
        username: user.username,
      },
    });

    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    // const validatedContactId = this.validationService.validate(ContactValidation.GET, contactId);

    const contact = await this.checkContactMustExists(user.username, contactId);

    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const validatedRequest: UpdateContactRequest =
      this.validationService.validate(ContactValidation.UPDATE, request);

    const contact = await this.checkContactMustExists(
      user.username,
      validatedRequest.id,
    );

    const updatedContact = await this.prismaService.contact.update({
      where: {
        username: contact.username,
        id: contact.id,
      },
      data: validatedRequest,
    });

    return {
      id: updatedContact.id,
      first_name: updatedContact.first_name,
      last_name: updatedContact.last_name,
      email: updatedContact.email,
      phone: updatedContact.phone,
    };
  }

  async remove(user: User, contactId: number): Promise<void> {
    const contact = await this.checkContactMustExists(user.username, contactId);

    await this.prismaService.contact.delete({
      where: {
        id: contact.id,
      },
    });
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const validatedRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters: Prisma.ContactWhereInput[] = [];

    if (validatedRequest.name) {
      filters.push({
        OR: [
          {
            first_name: {
              contains: validatedRequest.name,
            },
          },
          {
            last_name: {
              contains: validatedRequest.name,
            },
          },
        ],
      });
    }

    if (validatedRequest.email) {
      filters.push({
        email: {
          contains: validatedRequest.email,
        },
      });
    }

    if (validatedRequest.phone) {
      filters.push({
        phone: {
          contains: validatedRequest.phone,
        },
      });
    }

    const skip = (validatedRequest.page - 1) * validatedRequest.size;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filters,
      },
      take: validatedRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filters,
      },
    });

    return {
      data: contacts.map((contact) => ({
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
      })),
      paging: {
        current_page: validatedRequest.page,
        size: validatedRequest.size,
        total_page: Math.ceil(total / validatedRequest.size),
      },
    };
  }
}
