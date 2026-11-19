import { Expose } from 'class-transformer';
import { IsString, IsUUID, ValidateIf } from 'class-validator';

export class CartShopEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  name: string | null;
}
