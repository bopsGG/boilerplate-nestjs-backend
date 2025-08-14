/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isIdentificationId', async: false })
export class IsIdentificationIdConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;

    const identificationIdRegex = /^\d{13}$/;

    return identificationIdRegex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Username must be a valid identification ID.';
  }
}

export function IsIdentificationId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsIdentificationIdConstraint,
    });
  };
}
