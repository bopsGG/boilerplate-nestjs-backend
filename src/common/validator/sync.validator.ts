import { validateSync, ValidationError } from 'class-validator';
import { BadRequestErrorException } from '../dto';

export const SyncValidateWithBadRequestErrorException = (dto: object) => {
  const errors: ValidationError[] = validateSync(dto);
  if (errors.length > 0) {
    throw new BadRequestErrorException({
      meta: {
        validationErrors: errors.map((error) => ({
          fieldName: error.property,
          constraints: error.constraints || {},
        })),
      },
    });
  }
};
