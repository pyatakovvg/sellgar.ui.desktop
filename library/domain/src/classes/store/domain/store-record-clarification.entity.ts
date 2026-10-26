import { Expose } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class StoreRecordClarificationEntity {
  @Expose()
  @IsInt()
  @Min(0)
  position: number;

  @Expose()
  @IsString()
  value: string;
}
