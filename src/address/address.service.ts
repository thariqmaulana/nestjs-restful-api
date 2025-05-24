import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContactService } from '../contact/contact.service';
import { User } from '@prisma/client';
import { AddressResponse, CreateAddressRequest } from '../model/address.model';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger
  ) { }

  async create(user: User, request: CreateAddressRequest): Promise<AddressResponse> {
    console.log(request);
    
    const validatedRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request
    );

    await this.contactService.checkContactMustExists(user.username, request.contact_id);

    const address = await this.prismaService.address.create({
      data: validatedRequest
    });

    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code
    }
  }
}
