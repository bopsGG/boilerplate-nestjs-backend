/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEmailOrIdentificationId', async: false })
export class IsEmailOrIdentificationIdConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const identificationIdRegex = /^\d{13}$/;

    return emailRegex.test(value) || identificationIdRegex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Username must be a valid identification ID or email address.';
  }
}

export function IsEmailOrIdentificationId(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailOrIdentificationIdConstraint,
    });
  };
}
