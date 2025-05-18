import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter<ZodError> {
  catch(exception: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse()
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: exception.message,
      });
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
