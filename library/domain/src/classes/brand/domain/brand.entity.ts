import { Expose } from 'class-transformer';
import { IsString, ValidateIf } from 'class-validator';

import { Entity } from '@sellgar/app';

@Entity({ identity: 'code' })
export class BrandEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  description: string | null;
}
