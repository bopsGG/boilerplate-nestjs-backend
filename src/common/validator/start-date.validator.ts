/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'startDateValidator', async: false })
export class StartDateValidator implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const object = args.object as any;

    if (object?.startDate !== undefined && object?.endDate !== undefined) {
      if (object?.startDate > object?.endDate) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'startDate must be greater than endDate.';
  }
}
