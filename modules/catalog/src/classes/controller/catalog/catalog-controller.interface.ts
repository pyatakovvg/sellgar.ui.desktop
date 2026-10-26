import type { ControllerArgs, RuntimeController } from '@sellgar/app';
import type { CatalogResultEntity } from './domain/catalog-result.entity.ts';
export abstract class CatalogControllerInterface implements RuntimeController {
  abstract loader(args: ControllerArgs): Promise<CatalogResultEntity>;
}
