import { Expose } from 'class-transformer';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

import type { SetCartItemQuantityInput } from '../input/set-cart-item-quantity.input.ts';

export class SetCartItemQuantityDto implements SetCartItemQuantityInput {
  @Expose()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  version: string;

  @Expose()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity: number;
}
