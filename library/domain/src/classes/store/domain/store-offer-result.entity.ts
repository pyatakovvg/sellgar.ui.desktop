import { EntityCollection } from '@sellgar/app';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { MetaEntity } from '../../meta/index.ts';
import { StoreOfferEntity } from './store-offer.entity.ts';
@EntityCollection({ entity: StoreOfferEntity, property: 'data' })
export class StoreOfferResultEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOfferEntity)
  data: StoreOfferEntity[];
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
