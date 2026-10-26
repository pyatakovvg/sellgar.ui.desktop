import { PropertyOptionExtraKind } from './property-option-extra-kind.enum.ts';
import { PropertyOptionTextDisplay } from './property-option-text-display.enum.ts';
import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, ValidateIf, IsUUID } from 'class-validator';

export class PropertyOptionExtraEntity {
  @Expose()
  @IsEnum(PropertyOptionExtraKind)
  type: PropertyOptionExtraKind;

  @Expose()
  @IsInt()
  sortOrder: number;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsEnum(PropertyOptionTextDisplay)
  textDisplay: PropertyOptionTextDisplay | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueText: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueColor: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  imageUuid: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
