import { Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class MetaEntity {
  @Expose()
  @IsNumber()
  @IsOptional()
  totalRows?: number;
}
