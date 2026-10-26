import { Expose } from 'class-transformer';
import { IsInt, IsString, IsUUID } from 'class-validator';

export class VariantImageEntity {
  @Expose()
  @IsUUID()
  imageUuid: string;

  @Expose()
  @IsString()
  imageUrl: string;

  @Expose()
  @IsString()
  fileName: string;

  @Expose()
  @IsInt()
  order: number;
}
