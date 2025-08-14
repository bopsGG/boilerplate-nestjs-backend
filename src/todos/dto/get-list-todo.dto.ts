import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyExampleConstant } from '../../common/constant';
import { PaginationRequest } from '../../common/decorators/typeorm-paginate';
import { ApprovalStatusEnum, OrderDirectionEnum } from '../../common/enum';

export class GetListTodoDto extends PartialType(PaginationRequest) {
  @ApiPropertyOptional({
    description: 'Search keyword to filter todo items by name or description',
    example: ApiPropertyExampleConstant.KEYWORD_FOR_SEARCH,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Approval status used to filter todo items',
    example: ApprovalStatusEnum.PENDING,
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(ApprovalStatusEnum)
  status?: ApprovalStatusEnum;

  @ApiPropertyOptional({
    description: 'Filter todo items based on their active state',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBooleanString()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Field name to sort the results by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sorting direction of the results',
    enum: OrderDirectionEnum,
    default: OrderDirectionEnum.DESC,
  })
  @IsOptional()
  @IsEnum(OrderDirectionEnum)
  direction?: OrderDirectionEnum = OrderDirectionEnum.DESC;
}
