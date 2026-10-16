import type { StorefrontFieldInput, StorefrontOfferInput } from '@page/home';

export class StorefrontMapper {
  constructor(private readonly gatewayUrl: string) {}

  toOffer(offer: StorefrontOfferInput): StorefrontOfferInput {
    return {
      ...offer,
      product: { ...offer.product, properties: this.toFields(offer.product.properties) },
      variant: {
        ...offer.variant,
        properties: this.toFields(offer.variant.properties),
        images: [...offer.variant.images]
          .sort((left, right) => left.order - right.order)
          .map((image) => ({
            ...image,
            imageUrl: new URL(image.imageUrl, this.gatewayUrl).toString(),
          })),
      },
      records: offer.records.map((record) => ({
        ...record,
        clarifications: [...record.clarifications].sort((left, right) => left.position - right.position),
      })),
    };
  }

  private toFields(fields: StorefrontFieldInput[]): StorefrontFieldInput[] {
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
                    ? new URL(`/v1/files/${encodeURIComponent(extra.imageUuid)}`, this.gatewayUrl).toString()
                    : undefined,
              })),
          })),
        },
      }));
  }
}
