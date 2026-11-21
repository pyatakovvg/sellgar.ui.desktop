import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { CurrencyEntity } from '../../currency/index.ts';

export class StorePriceRangeEntity {
  @Expose()
  @IsString()
  min: string;

  @Expose()
  @IsString()
  max: string;

  @Expose()
  @IsString()
  currencyCode: string;

  @Expose()
  @ValidateNested()
  @Type(() => CurrencyEntity)
  currency: CurrencyEntity;
}
