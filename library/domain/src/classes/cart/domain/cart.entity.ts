import { Expose, Type } from 'class-transformer';
import { IsArray, IsDefined, IsString, IsUUID, Matches, ValidateIf, ValidateNested } from 'class-validator';

import { Entity } from '@sellgar/app';

import { CartItemEntity } from './cart-item.entity.ts';
import { CartShopEntity } from './cart-shop.entity.ts';

@Entity({ identity: 'uuid' })
export class CartEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  @Matches(/^(0|[1-9]\d*)$/)
  version: string;

  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => CartShopEntity)
  shop: CartShopEntity;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemEntity)
  items: CartItemEntity[];

  @Expose()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  itemsTotal: string | null;
}
