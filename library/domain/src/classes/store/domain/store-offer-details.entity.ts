import { Expose, Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { StoreOfferEntity } from './store-offer.entity.ts';
export class StoreOfferDetailsEntity {
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => StoreOfferEntity)
  offer: StoreOfferEntity;
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOfferEntity)
  siblingOffers: StoreOfferEntity[];
}
