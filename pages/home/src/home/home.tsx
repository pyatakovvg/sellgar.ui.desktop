'use client';

import React from 'react';

import { Badge, Typography } from '@sellgar/kit';

import { ProductCard } from '@library/design';
import type { StoreOfferEntity } from '@library/domain';

import { formatPrice, getInitials, getPreviewImage } from '../formatter/offer.formatter.ts';
import s from './default.module.css';

interface IProps {
  products: StoreOfferEntity[];
  failedToLoad?: boolean;
}

export const HomeComponent: React.FC<IProps> = (props) => {
  return (
    <div className={s.page}>
      <section className={s.summary}>
        <div>
          <Typography size="h4" weight="semi-bold">
            <h1>Каталог товаров</h1>
          </Typography>
          <Typography size="body-s" weight="regular">
            <p>Доступные позиции магазина</p>
          </Typography>
        </div>
        <Badge label={props.products.length} color="gray" />
      </section>
      {props.failedToLoad || props.products.length === 0 ? (
        <section className={s.status}>
          <Typography size="h6" weight="semi-bold">
            <h2>{props.failedToLoad ? 'Не удалось загрузить товары' : 'Товаров пока нет'}</h2>
          </Typography>
          <Typography size="body-s" weight="regular">
            <p>{props.failedToLoad ? 'Попробуйте обновить страницу позже' : 'На витрине нет активных позиций'}</p>
          </Typography>
        </section>
      ) : (
        <section className={s.grid}>
          {props.products.map((offer) => {
            const image = getPreviewImage(offer);
            const href = `/offers/${offer.uuid}`;

            return (
              <ProductCard
                key={offer.uuid}
                href={href}
                name={offer.product.name}
                variantName={offer.variant.name}
                brandName={offer.brand?.name}
                imageUrl={image?.imageUrl}
                imagePlaceholder={getInitials(offer.product.name)}
                price={formatPrice(offer)}
              />
            );
          })}
        </section>
      )}
    </div>
  );
};
