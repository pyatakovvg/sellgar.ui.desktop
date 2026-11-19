import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDefined, ValidateIf, ValidateNested } from 'class-validator';

import { CategoryPathEntity, StoreOfferEntity } from '@library/domain';

export class OfferDetailsResultEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryPathEntity)
  categories: CategoryPathEntity[];

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsDefined()
  @ValidateNested()
  @Type(() => StoreOfferEntity)
  offer: StoreOfferEntity | null;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOfferEntity)
  siblingOffers: StoreOfferEntity[];

  @Expose()
  @IsBoolean()
  failedToLoad: boolean;
}
