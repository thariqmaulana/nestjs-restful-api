import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContactService } from '../contact/contact.service';
import { Address, User } from '@prisma/client';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from '../model/address.model';
import { AddressValidation } from './address.validation';
import { WebResponse } from '../model/web.model';

@Injectable()
export class AddressService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code,
    };
  }

  async checkAddressMustExists(
    contact_id: number,
    address_id: number,
  ): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        contact_id: contact_id,
        id: address_id,
      },
    });

    if (!address) {
      throw new NotFoundException();
    }

    return address;
  }

  async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    console.log(request);

    const validatedRequest: CreateAddressRequest =
      this.validationService.validate(AddressValidation.CREATE, request);

    await this.contactService.checkContactMustExists(
      user.username,
      validatedRequest.contact_id,
    );

    const address = await this.prismaService.address.create({
      data: validatedRequest,
    });

    return this.toAddressResponse(address);
  }

  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    const validatedRequest: GetAddressRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.checkContactMustExists(
      user.username,
      validatedRequest.contact_id,
    );

    const address = await this.checkAddressMustExists(
      validatedRequest.contact_id,
      validatedRequest.address_id,
    );

    return this.toAddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const validatedRequest: UpdateAddressRequest =
      this.validationService.validate(AddressValidation.UPDATE, request);

    await this.contactService.checkContactMustExists(
      user.username,
      validatedRequest.contact_id,
    );

    const address = await this.checkAddressMustExists(
      validatedRequest.contact_id,
      validatedRequest.address_id,
    );

    const updatedAddress = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
      data: {
        street: validatedRequest.street,
        city: validatedRequest.city,
        province: validatedRequest.province,
        country: validatedRequest.country,
        postal_code: validatedRequest.postal_code,
      },
    });

    console.log(updatedAddress);

    return this.toAddressResponse(updatedAddress);
  }

  async remove(user: User, request: RemoveAddressRequest): Promise<void> {
    const validatedRequest: RemoveAddressRequest =
      this.validationService.validate(AddressValidation.REMOVE, request);

    await this.contactService.checkContactMustExists(
      user.username,
      validatedRequest.contact_id,
    );

    await this.checkAddressMustExists(
      validatedRequest.contact_id,
      validatedRequest.address_id,
    );

    await this.prismaService.address.delete({
      where: {
        contact_id: validatedRequest.contact_id,
        id: validatedRequest.address_id,
      },
    });

    return;
  }

  async list(user: User, contactId: number): Promise<AddressResponse[]> {
    await this.contactService.checkContactMustExists(user.username, contactId);

    const addresses = await this.prismaService.address.findMany({
      where: {
        contact_id: contactId,
      },
    });

    return addresses.map((address) => this.toAddressResponse(address));
  }
}
