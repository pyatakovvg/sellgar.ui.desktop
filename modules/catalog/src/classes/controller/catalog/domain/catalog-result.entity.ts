import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { StoreOfferEntity } from '@library/domain';
export class CatalogResultEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOfferEntity)
  products: StoreOfferEntity[];
  @Expose()
  @IsBoolean()
  failedToLoad: boolean;
}
