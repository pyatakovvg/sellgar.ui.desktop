import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { Entity } from '@sellgar/app';

@Entity({ identity: 'uuid' })
export class CategoryPathItemEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;
}
