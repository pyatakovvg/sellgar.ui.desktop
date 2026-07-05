import { Heading, Text } from '@library/kit';

import React from 'react';

import {
  formatStorefrontPrice,
  getStorefrontPreviewImage,
  type StorefrontProduct,
} from './home.component.tsx';
import styles from './default.module.scss';

export interface StorefrontOfferDetailsResult {
  offer: StorefrontProduct;
  siblingOffers: StorefrontProduct[];
}

interface IProps {
  offer?: StorefrontProduct | null;
  siblingOffers: StorefrontProduct[];
  failedToLoad?: boolean;
}

export const OfferDetailsComponent: React.FC<IProps> = ({ offer, siblingOffers, failedToLoad }) => {
  if (failedToLoad) {
    return (
      <div className={styles.page}>
        <StatusBlock title="Не удалось загрузить предложение" text="Client gateway временно недоступен" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className={styles.page}>
        <StatusBlock title="Предложение не найдено" text="На витрине нет такого активного предложения" />
      </div>
    );
  }

  const previewImage = getStorefrontPreviewImage(offer);
  const properties = getProperties(offer);
  const otherOffers = siblingOffers.filter((variantOffer) => variantOffer.offerUuid !== offer.offerUuid);
  const descriptionSections = getDescriptionSections(offer);

  return (
    <div className={styles.page}>
      <a className={styles.backLink} href="/">
        Вернуться в каталог
      </a>

      <section className={styles.offerDetails}>
        <div className={styles.offerPreview}>
          {previewImage ? (
            <img src={previewImage.imageUrl} alt={previewImage.alt ?? offer.name} />
          ) : (
            <span>{getProductInitials(offer.name)}</span>
          )}
        </div>

        <div className={styles.offerInfo}>
          <div className={styles.meta}>
            {offer.category?.name ? <span>{offer.category.name}</span> : null}
            {offer.brand?.name ? <span>{offer.brand.name}</span> : null}
            {offer.article ? <span>{offer.article}</span> : null}
          </div>

          <Heading>
            <h1>{offer.product.name}</h1>
          </Heading>

          <div className={styles.offerNames}>
            <div>
              <span>Товар</span>
              <strong>{offer.product.name}</strong>
            </div>
            <div>
              <span>Вариант</span>
              <strong>{offer.variant.name}</strong>
            </div>
          </div>

          {descriptionSections.length > 0 ? (
            <div className={styles.descriptionSections}>
              {descriptionSections.map((section) => (
                <Text key={section.title}>
                  <p className={styles.offerDescription}>
                    <span>{section.title}</span>
                    {section.text}
                  </p>
                </Text>
              ))}
            </div>
          ) : null}

          <div className={styles.offerPrice}>{formatStorefrontPrice(offer)}</div>

          {typeof offer.inventory?.available === 'number' ? (
            <Text variant="compact">
              <p className={styles.stock}>Доступно: {offer.inventory.available}</p>
            </Text>
          ) : null}

          {properties.length > 0 ? (
            <dl className={styles.properties}>
              {properties.map((item) => (
                <div key={item.uuid}>
                  <dt>{item.property?.name ?? 'Свойство'}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      {otherOffers.length > 0 ? (
        <section className={styles.variantsSection}>
          <Heading variant="h4">
            <h2>Другие предложения товара</h2>
          </Heading>

          <div className={styles.variantLinks}>
            {otherOffers.map((variantOffer) => {
              const variantImage = getStorefrontPreviewImage(variantOffer);

              return (
                <a
                  key={variantOffer.offerUuid}
                  className={styles.variantLink}
                  href={`/offers/${variantOffer.offerUuid}`}
                >
                  <span className={styles.variantThumb}>
                    {variantImage ? (
                      <img src={variantImage.imageUrl} alt={variantImage.alt ?? variantOffer.name} />
                    ) : (
                      getProductInitials(variantOffer.name)
                    )}
                  </span>
                  <span>
                    <span className={styles.variantProductName}>{variantOffer.product.name}</span>
                    <span className={styles.variantName}>{variantOffer.name}</span>
                    <span className={styles.variantPrice}>{formatStorefrontPrice(variantOffer)}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
};

const StatusBlock: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <section className={styles.status}>
    <Heading variant="h4">
      <h2>{title}</h2>
    </Heading>
    <Text>
      <p>{text}</p>
    </Text>
  </section>
);

function getProductInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getDescriptionSections(offer: StorefrontProduct) {
  const productDescription = offer.product.description?.trim();
  const variantDescription = offer.variant.description?.trim();

  return [
    productDescription ? { title: 'О товаре', text: productDescription } : null,
    variantDescription && variantDescription !== productDescription
      ? { title: 'О предложении', text: variantDescription }
      : null,
  ].filter((section): section is { title: string; text: string } => Boolean(section));
}

function getProperties(offer: StorefrontProduct) {
  return [...(offer.product.properties ?? []), ...(offer.variant.properties ?? [])];
}
