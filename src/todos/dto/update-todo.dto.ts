import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApprovalStatusEnum } from '../../common/enum';
import { CreateTodoDto } from './create-todo.dto';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({
    description: 'Approval status of the todo item',
    example: ApprovalStatusEnum.PENDING,
    type: 'enum',
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(ApprovalStatusEnum)
  status?: ApprovalStatusEnum;

  @ApiPropertyOptional({
    description: 'Indicates whether the todo item is active',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
