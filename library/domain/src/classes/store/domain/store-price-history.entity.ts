import { Expose, Type } from 'class-transformer';
import { IsDefined, IsNumberString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CurrencyEntity } from '../../currency/index.ts';
export class StorePriceHistoryEntity {
  @Expose()
  @IsUUID()
  uuid: string;
  @Expose()
  @IsNumberString()
  value: string;
  @Expose()
  @IsString()
  currencyCode: string;
  @Expose()
  @IsOptional()
  @IsDefined()
  @ValidateNested()
  @Type(() => CurrencyEntity)
  currency?: CurrencyEntity;
}
