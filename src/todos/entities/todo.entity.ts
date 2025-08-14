import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiPropertyExampleConstant } from '../../common/constant';
import {
  DefaultCreateDateTransformer,
  DefaultUpdateDateTransformer,
} from '../../common/database/default-date-transformer';
import { ApprovalStatusEnum } from '../../common/enum';
import { decryptFromAES, encryptToAes } from '../../common/util';
import { TodoDetail } from './todo-detail.entity';

@Entity({ name: 'todos' })
export class Todo {
  @ApiProperty({
    description: 'Unique identifier for this todo item',
    example: ApiPropertyExampleConstant.NANO_ID,
    type: 'string',
    maxLength: 50,
  })
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Read a book',
    type: 'string',
    maxLength: 100,
  })
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @ApiPropertyOptional({
    description: 'Encrypted version of the todo title',
    example: JSON.stringify(encryptToAes('Read a book')),
    type: 'string',
    format: 'text',
  })
  @Column({
    name: 'encrypted_name',
    type: 'text',
    transformer: {
      to: (value) => JSON.stringify(encryptToAes(value)),
      from: (value) => {
        const parsedValue = JSON.parse(value);

        return decryptFromAES(
          parsedValue.encryptedData,
          parsedValue.encryptedKey,
          parsedValue.iv,
        );
      },
    },
  })
  encryptedName?: string;

  @ApiPropertyOptional({
    description: 'Short description or notes about the todo item',
    example: 'Read some pages',
    type: 'string',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ApiPropertyOptional({
    description: 'Name of the user who created the todo',
    example: 'Bo',
    type: 'string',
    maxLength: 100,
    nullable: true,
  })
  @Column({
    name: 'creator_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  creatorName?: string;

  @ApiPropertyOptional({
    description: 'Approval status of the todo item',
    example: ApprovalStatusEnum.PENDING,
    type: 'enum',
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
  })
  status: ApprovalStatusEnum;

  @ApiPropertyOptional({
    description: 'Indicates whether the todo is currently active',
    example: true,
    type: 'boolean',
    default: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when the todo item was created',
    example: new Date(),
    type: 'date',
    format: 'timestamp',
    default: new Date(),
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    transformer: new DefaultCreateDateTransformer(),
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the todo item was last updated',
    example: new Date(),
    type: 'date',
    format: 'timestamp',
    default: new Date(),
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    transformer: new DefaultUpdateDateTransformer(),
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'List of detail items associated with this todo',
    type: () => [TodoDetail],
  })
  @OneToMany(() => TodoDetail, (tododetail) => tododetail.todo)
  todoDetails?: TodoDetail[];
}
