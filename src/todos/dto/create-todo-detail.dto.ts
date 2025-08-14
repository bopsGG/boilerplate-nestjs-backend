import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDetailDto {
  @ApiProperty({
    description: 'Title or name of the todo detail item',
    example: 'Read a book',
    type: 'string',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
