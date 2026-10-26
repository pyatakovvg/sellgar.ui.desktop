import { Entity } from '@sellgar/app';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, ValidateIf, ValidateNested, IsUUID } from 'class-validator';
import { ProductFieldEntity } from '../../product/index.ts';
import { VariantImageEntity } from './variant-image.entity.ts';

@Entity({ identity: 'uuid' })
export class VariantEntity {
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

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantImageEntity)
  images: VariantImageEntity[];
}
