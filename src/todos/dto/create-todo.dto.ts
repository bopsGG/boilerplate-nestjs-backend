import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Read a book',
    type: 'string',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description or notes for the todo item',
    example: 'Read some pages',
    type: 'string',
    maxLength: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Name of the person who created this todo item',
    example: 'Bo',
    type: 'string',
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  creatorName?: string;
}
