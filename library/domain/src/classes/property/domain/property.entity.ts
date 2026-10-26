import { PropertyKind } from './property-kind.enum.ts';
import { Entity } from '@sellgar/app';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { PropertyOptionEntity } from './property-option.entity.ts';

@Entity({ identity: 'code' })
export class PropertyEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  description: string | null;

  @Expose()
  @IsEnum(PropertyKind)
  kind: PropertyKind;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  unitCode: string | null;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyOptionEntity)
  options: PropertyOptionEntity[];
}
