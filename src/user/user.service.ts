import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { v4 as uuid } from 'uuid';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(
      `UserService.register(${JSON.stringify(request.username)})`,
    );

    const validatedRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const matchingUsernameCount = await this.prismaService.user.count({
      where: {
        username: validatedRequest.username,
      },
    });

    if (matchingUsernameCount != 0) {
      throw new HttpException('Username already exists', 400);
    }

    validatedRequest.password = await bcrypt.hash(
      validatedRequest.password,
      10,
    );

    const user = await this.prismaService.user.create({
      data: validatedRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`UserService.login(${JSON.stringify(request.username)})`);

    const validatedRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: validatedRequest.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Username or Password is wrong');
    }

    const isPasswordValid = await bcrypt.compare(
      validatedRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Username or Password is wrong');
    }

    user = await this.prismaService.user.update({
      where: {
        username: validatedRequest.username,
      },
      data: {
        token: uuid(),
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    this.logger.info(`UserService.get(${JSON.stringify(user.username)})`);
    return {
      username: user.username,
      name: user.name,
      token: user.token,
    };
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.info(`UserService.update(${JSON.stringify(user.username)})`);

    const validatedRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );
    console.log(validatedRequest);

    const data: Partial<{
      name: string;
      password: string;
    }> = {};

    if (validatedRequest.name) {
      data.name = validatedRequest.name;
    }
    if (validatedRequest.password) {
      data.password = await bcrypt.hash(validatedRequest.password, 10);
    }

    console.log(data);

    const userUpdated = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data,
    });

    return {
      username: userUpdated.username,
      name: userUpdated.name,
    };
  }

  async logout(user: User): Promise<void> {
    await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: null,
      },
    });
  }
}
