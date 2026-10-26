import { Expose } from 'class-transformer';
import { IsBoolean, IsString, ValidateIf } from 'class-validator';

export class PropertyValueEntity {
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueText: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueInteger: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueDecimal: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsBoolean()
  valueBoolean: boolean | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueDate: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  valueOptionCode: string | null;
}
