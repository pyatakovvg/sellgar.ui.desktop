import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { PropertyOptionExtraEntity } from './property-option-extra.entity.ts';

export class PropertyOptionEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  sortOrder: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyOptionExtraEntity)
  extras: PropertyOptionExtraEntity[];
}
