/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFileMaxSize', async: false })
export class FileMaxSizeConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File, args: ValidationArguments): boolean {
    const [maxSizeInBytes] = args.constraints;
    if (!file) return true;

    return file.size <= maxSizeInBytes;
  }

  defaultMessage(args: ValidationArguments): string {
    const [maxSizeInBytes] = args.constraints;

    return `${args.property} must not exceed ${(maxSizeInBytes / (1024 * 1024)).toFixed(2)}MB`;
  }
}

export function IsFileMaxSize(
  maxSizeInBytes: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxSizeInBytes],
      validator: FileMaxSizeConstraint,
    });
  };
}
