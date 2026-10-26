import { Entity } from '@sellgar/app';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDateString, IsDefined, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
import { BrandEntity } from '../../brand/index.ts';
import { ProductSummaryEntity } from '../../product/index.ts';
import { VariantEntity } from '../../variant/index.ts';
import { StoreAccountingRecordEntity } from './store-accounting-record.entity.ts';
import { StorePriceHistoryEntity } from './store-price-history.entity.ts';
@Entity({ identity: 'uuid' })
export class StoreOfferEntity {
  @Expose()
  @IsUUID()
  uuid: string;
  @Expose()
  @IsUUID()
  storeProductUuid: string;
  @Expose()
  @IsUUID()
  productUuid: string;
  @Expose()
  @IsUUID()
  variantUuid: string;
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => ProductSummaryEntity)
  product: ProductSummaryEntity;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsDefined()
  @ValidateNested()
  @Type(() => BrandEntity)
  brand: BrandEntity | null;
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => VariantEntity)
  variant: VariantEntity;
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreAccountingRecordEntity)
  records: StoreAccountingRecordEntity[];
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsDefined()
  @ValidateNested()
  @Type(() => StorePriceHistoryEntity)
  currentPrice: StorePriceHistoryEntity | null;
  @Expose()
  @IsDateString()
  createdAt: string;
  @Expose()
  @IsDateString()
  updatedAt: string;
}
