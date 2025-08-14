import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiPropertyExampleConstant } from '../../common/constant';
import {
  DefaultCreateDateTransformer,
  DefaultUpdateDateTransformer,
} from '../../common/database/default-date-transformer';
import { Todo } from './todo.entity';

@Entity({ name: 'todo_details' })
export class TodoDetail {
  @ApiProperty({
    description: 'Unique identifier for this todo detail',
    example: ApiPropertyExampleConstant.NANO_ID,
    type: 'string',
    maxLength: 50,
  })
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @ApiProperty({
    description: 'ID of the related todo task (foreign key)',
    example: ApiPropertyExampleConstant.NANO_ID,
    type: 'string',
    maxLength: 50,
  })
  @Column({ name: 'todo_id', type: 'varchar', length: 50 })
  todoId: string;

  @ApiProperty({
    description: 'Title or name of the todo detail item',
    example: 'Read a book',
    type: 'string',
    maxLength: 100,
  })
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @ApiPropertyOptional({
    description: 'Indicates whether this detail is active',
    example: true,
    type: 'boolean',
    default: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when this todo detail was created',
    example: new DefaultUpdateDateTransformer(),
    type: 'date',
    format: 'timestamp',
    default: new DefaultUpdateDateTransformer(),
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    transformer: new DefaultCreateDateTransformer(),
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when this todo detail was last updated',
    example: new DefaultUpdateDateTransformer(),
    type: 'date',
    format: 'timestamp',
    default: new DefaultUpdateDateTransformer(),
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    transformer: new DefaultUpdateDateTransformer(),
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'The Todo item that this detail belongs to',
    type: () => Todo,
  })
  @ManyToOne(() => Todo, (todo) => todo.todoDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'todo_id' })
  todo?: Todo;
}
