import { Expose, Type } from 'class-transformer';
import { IsArray, IsDefined, IsInt, IsString, ValidateNested, IsBoolean } from 'class-validator';
import { PropertyEntity } from '../../property/index.ts';
import { PropertyValueEntity } from './property-value.entity.ts';

export class ProductFieldEntity {
  @Expose()
  @IsString()
  propertyCode: string;

  @Expose()
  @IsBoolean()
  required: boolean;

  @Expose()
  @IsBoolean()
  multiple: boolean;

  @Expose()
  @IsInt()
  sortOrder: number;

  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => PropertyEntity)
  property: PropertyEntity;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyValueEntity)
  values: PropertyValueEntity[];
}
