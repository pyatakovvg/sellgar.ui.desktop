import { Expose, Type } from 'class-transformer';
import { IsArray, IsDateString, IsDefined, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

import { Entity } from '@sellgar/app';

import { StoreRecordClarificationEntity } from './store-record-clarification.entity.ts';
import { StoreRecordInventoryEntity } from './store-record-inventory.entity.ts';

@Entity({ identity: 'uuid' })
export class StoreAccountingRecordEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  offerUuid: string;

  @Expose()
  @IsString()
  article: string;

  @Expose()
  @IsInt()
  @Min(0)
  order: number;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreRecordClarificationEntity)
  clarifications: StoreRecordClarificationEntity[];

  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => StoreRecordInventoryEntity)
  inventory: StoreRecordInventoryEntity;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}
