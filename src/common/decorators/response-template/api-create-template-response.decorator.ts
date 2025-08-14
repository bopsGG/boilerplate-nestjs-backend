import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseTemplateDto } from '../../dto';
import { ApiTemplateResponseOptions } from './types';

// Tutorial create controller decorator for swagger api generic type
// https://pietrzakadrian.com/blog/how-to-create-pagination-in-nestjs-with-typeorm-swagger

export const ApiCreatedTemplateResponse = (
  options: ApiTemplateResponseOptions,
) =>
  applyDecorators(
    ApiExtraModels(ResponseTemplateDto, options.model),
    ApiCreatedResponse({
      description: options.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseTemplateDto) },
          {
            properties: {
              status: {
                type: 'object',
                properties: {
                  code: {
                    type: 'number',
                    example: 201,
                  },
                  message: {
                    type: 'string',
                    example: 'Created',
                  },
                },
              },
              data: {
                $ref: getSchemaPath(options.model),
              },
            },
          },
        ],
      },
    }),
  );
