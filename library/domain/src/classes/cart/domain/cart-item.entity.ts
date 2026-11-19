import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CartPriceEntity } from './cart-price.entity.ts';

export class CartItemEntity {
  @Expose()
  @IsUUID()
  recordUuid: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  offerUuid: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  productUuid: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  variantUuid: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  productName: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  variantName: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  article: string | null;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  clarifications: string[];

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  imageUuid: string | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @Transform(({ value }) => value ?? null)
  imageUrl: string | null = null;

  @Expose()
  @IsInt()
  @Min(1)
  quantity: number;

  @Expose()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  version: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsInt()
  @Min(0)
  availableQuantity: number | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsDefined()
  @ValidateNested()
  @Type(() => CartPriceEntity)
  price: CartPriceEntity | null;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  subtotal: string | null;

  @Expose()
  @IsArray()
  @IsIn(
    [
      'not_sold',
      'hidden',
      'sync_pending',
      'price_missing',
      'currency_mismatch',
      'out_of_stock',
      'insufficient_stock',
      'checkout_in_progress',
    ],
    { each: true },
  )
  reasons: string[];

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  message: string | null;

  @Expose()
  @IsBoolean()
  canCheckout: boolean;

  @Expose()
  @IsBoolean()
  canOpenProduct: boolean;

  @Expose()
  @IsBoolean()
  canIncrease: boolean;

  @Expose()
  @IsBoolean()
  canDecrease: boolean;

  @Expose()
  @IsBoolean()
  canRemove: boolean;
}
