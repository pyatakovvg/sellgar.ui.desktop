import { Text, Heading } from '@library/kit';

import React from 'react';

import styles from './default.module.scss';

export interface StorefrontProductResult {
  data: StorefrontProduct[];
  meta: {
    totalRows: number;
  };
}

export interface StorefrontPropertyOptionMetadata {
  uuid: string;
  valueType: 'TEXT' | 'COLOR' | 'IMAGE' | 'ICON';
  sortOrder: number;
  textValue?: string | null;
  colorValue?: string | null;
  fileUuid?: string | null;
  imageUrl?: string | null;
  iconCode?: string | null;
}

export interface StorefrontPropertyOption {
  uuid: string;
  name: string;
  metadata: StorefrontPropertyOptionMetadata[];
}

export interface StorefrontPropertyValue {
  uuid: string;
  optionUuid?: string | null;
  value: string;
  property?: {
    name: string;
  } | null;
  option?: StorefrontPropertyOption | null;
}

export interface StorefrontProduct {
  uuid: string;
  offerUuid: string;
  storeProductUuid: string;
  productUuid: string;
  variantUuid: string;
  article: string;
  name: string;
  description: string;
  product: {
    uuid: string;
    name: string;
    description: string;
    properties?: StorefrontPropertyValue[];
  };
  brand?: {
    name: string;
  } | null;
  category?: {
    name: string;
  } | null;
  variant: {
    uuid?: string;
    name: string;
    description?: string;
    properties?: StorefrontPropertyValue[];
    images: {
      imageUrl: string;
      fileName?: string;
      alt?: string | null;
    }[];
  };
  currentPrice?: {
    value: string;
    currencyCode: string;
    currency?: {
      value: string;
    };
  } | null;
  inventory?: {
    available: number;
  } | null;
}

interface IProps {
  products: StorefrontProduct[];
  failedToLoad?: boolean;
}

export const HomeComponent: React.FC<IProps> = ({ products, failedToLoad }) => {
  return (
    <div className={styles.page}>
      <section className={styles.summary}>
        <div>
          <Heading>
            <h1>Каталог товаров</h1>
          </Heading>
          <Text>
            <p>Доступные позиции магазина</p>
          </Text>
        </div>
        <span className={styles.counter}>{products.length}</span>
      </section>

      {failedToLoad ? (
        <StatusBlock title="Не удалось загрузить товары" text="Client gateway временно недоступен" />
      ) : null}

      {!failedToLoad && products.length === 0 ? (
        <StatusBlock title="Товаров пока нет" text="На витрине нет активных позиций" />
      ) : null}

      {products.length > 0 ? (
        <section className={styles.grid}>
          {products.map((product) => (
            <a key={product.uuid} className={styles.card} href={`/offers/${product.offerUuid}`}>
              <div className={styles.preview}>
                {getPreviewImage(product) ? (
                  <img
                    src={getPreviewImage(product)?.imageUrl ?? ''}
                    alt={getPreviewImage(product)?.alt ?? product.name}
                  />
                ) : (
                  <span>{getProductInitials(product.name)}</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  {product.category?.name ? <span>{product.category.name}</span> : null}
                  {product.brand?.name ? <span>{product.brand.name}</span> : null}
                </div>
                <Heading variant="h4">
                  <h2>{product.product.name}</h2>
                </Heading>
                {product.variant.name && product.variant.name !== product.product.name ? (
                  <span className={styles.variantLabel}>{product.variant.name}</span>
                ) : null}
                {product.description ? (
                  <Text variant="compact">
                    <p className={styles.description}>{product.description}</p>
                  </Text>
                ) : null}
                <div className={styles.footer}>
                  <span className={styles.price}>{formatPrice(product)}</span>
                  <span className={styles.offers}>{product.article}</span>
                </div>
              </div>
            </a>
          ))}
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

function formatPrice(product: StorefrontProduct) {
  const price = product.currentPrice;

  if (!price) {
    return 'Цена уточняется';
  }

  const value = Number(price.value);
  const formattedValue = Number.isFinite(value) ? value.toLocaleString('ru-RU') : price.value;

  return `${formattedValue} ${price.currency?.value ?? price.currencyCode}`;
}

function getProductInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getPreviewImage(product: StorefrontProduct) {
  return product.variant.images.find((image) => image.imageUrl);
}

export function formatStorefrontPrice(product: StorefrontProduct) {
  return formatPrice(product);
}

export function getStorefrontPreviewImage(product: StorefrontProduct) {
  return getPreviewImage(product);
}
