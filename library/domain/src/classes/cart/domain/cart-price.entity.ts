import { Expose } from 'class-transformer';
import { IsString, IsUUID, Matches } from 'class-validator';

export class CartPriceEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  value: string;

  @Expose()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode: string;
}
