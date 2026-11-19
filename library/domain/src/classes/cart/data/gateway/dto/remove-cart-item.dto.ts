import { Expose } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class RemoveCartItemDto {
  @Expose()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  version: string;
}
