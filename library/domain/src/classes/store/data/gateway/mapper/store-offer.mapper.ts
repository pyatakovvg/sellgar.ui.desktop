import type { ProductFieldEntity } from '../../../../product/index.ts';
import type { StoreOfferEntity } from '../../../domain/store-offer.entity.ts';

export class StoreOfferMapper {
  static toOffer(offer: StoreOfferEntity, gatewayUrl: string): StoreOfferEntity {
    return {
      ...offer,
      product: { ...offer.product, properties: this.toFields(offer.product.properties, gatewayUrl) },
      variant: {
        ...offer.variant,
        properties: this.toFields(offer.variant.properties, gatewayUrl),
        images: [...offer.variant.images]
          .sort((left, right) => left.order - right.order)
          .map((image) => ({
            ...image,
            imageUrl: new URL(image.imageUrl, gatewayUrl).toString(),
          })),
      },
      records: offer.records.map((record) => ({
        ...record,
        clarifications: [...record.clarifications].sort((left, right) => left.position - right.position),
      })),
    };
  }

  private static toFields(fields: ProductFieldEntity[], gatewayUrl: string): ProductFieldEntity[] {
    return [...fields]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((field) => ({
        ...field,
        property: {
          ...field.property,
          options: field.property.options.map((option) => ({
            ...option,
            extras: [...option.extras]
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((extra) => ({
                ...extra,
                imageUrl:
                  extra.type === 'IMAGE' && extra.imageUuid
                    ? new URL(`/v1/files/${encodeURIComponent(extra.imageUuid)}`, gatewayUrl).toString()
                    : undefined,
              })),
          })),
        },
      }));
  }
}
