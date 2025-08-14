import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AttachmentAllowedMimeTypesEnum } from '../enum';

@ValidatorConstraint({ name: 'isFileMimeType', async: false })
export class FileMimeTypeConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File, args: ValidationArguments): boolean {
    if (!file) return true;

    const allowedTypes = args
      .constraints[0] as AttachmentAllowedMimeTypesEnum[];

    return allowedTypes.includes(
      file.mimetype as AttachmentAllowedMimeTypesEnum,
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const allowedTypes = args
      .constraints[0] as AttachmentAllowedMimeTypesEnum[];

    return `${args.property} must be of types: ${allowedTypes.join(', ')}`;
  }
}

export function IsFileMimeType(
  allowedTypes: AttachmentAllowedMimeTypesEnum[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [allowedTypes],
      validator: FileMimeTypeConstraint,
    });
  };
}
