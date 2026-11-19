import { Expose } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

import type { AddCartItemInput } from '../input/add-cart-item.input.ts';

export class AddCartItemDto implements AddCartItemInput {
  @Expose()
  @IsUUID()
  recordUuid: string;

  @Expose()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity: number;
}
