import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { WebResponse } from '../model/web.model';

@Controller('/api/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Auth() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(user, request);
    return {
      data: result,
    };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.get(user, contactId);
    return {
      data: result,
    };
  }

  @Put('/:contactId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateContactRequest,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    request.id = contactId;
    const result = await this.contactService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<boolean>> {
    const result = await this.contactService.remove(user, contactId);
    return {
      data: true,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Auth() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ): Promise<WebResponse<ContactResponse[]>> {
    const request: SearchContactRequest = {
      name,
      email,
      phone,
      page: page || 1,
      size: size || 5,
    };
    const result = await this.contactService.search(user, request);
    return result;
  }
}
