import { Entity } from '@sellgar/app';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, ValidateIf, ValidateNested, IsUUID } from 'class-validator';
import { ProductFieldEntity } from './product-field.entity.ts';

@Entity({ identity: 'uuid' })
export class ProductSummaryEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  description: string | null;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFieldEntity)
  properties: ProductFieldEntity[];
}
