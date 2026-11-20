'use client';

import React from 'react';

import { Link } from '@sellgar/app/next';
import { Badge, Card, LinkTypography, Typography } from '@sellgar/kit';

import type { CategoryPathEntity, StoreOfferEntity } from '@library/domain';

import { formatPrice } from '../formatter/offer.formatter.ts';
import { Categories } from './categories';
import s from './default.module.css';
import { Gallery } from './gallery';
import { Properties } from './properties';

interface IProps {
  offer?: StoreOfferEntity | null;
  siblingOffers: StoreOfferEntity[];
  categories: CategoryPathEntity[];
  failedToLoad?: boolean;
  purchase: React.ReactNode;
}

export const OfferDetailsComponent: React.FC<IProps> = (props) => {
  if (props.failedToLoad || !props.offer) {
    return (
      <div className={s.page}>
        <Categories paths={[]} name="Предложение недоступно" />
        <Card>
          <div className={s.status}>
            <Typography size="h6" weight="semi-bold">
              <h1>{props.failedToLoad ? 'Не удалось загрузить предложение' : 'Предложение не найдено'}</h1>
            </Typography>
            <Typography size="body-s" weight="regular">
              <p>
                {props.failedToLoad
                  ? 'Попробуйте обновить страницу позже'
                  : 'На витрине нет такого активного предложения'}
              </p>
            </Typography>
          </div>
        </Card>
      </div>
    );
  }

  const offer = props.offer;
  const hasProperties = offer.product.properties.length > 0 || offer.variant.properties.length > 0;

  return (
    <div className={s.page}>
      <header className={s.heading}>
        <Categories paths={props.categories} name={offer.product.name} />
        <Typography size="h5" weight="semi-bold">
          <h1 className={s.title}>{offer.product.name}</h1>
        </Typography>
      </header>
      <Card>
        <div className={s.overview}>
          <Gallery key={offer.uuid} images={offer.variant.images} name={offer.product.name} />
          <div className={s.info}>
            {offer.brand ? (
              <Typography size="body-s" weight="medium">
                <p className={s.brand}>{offer.brand.name}</p>
              </Typography>
            ) : null}
            {props.siblingOffers.length > 1 ? (
              <nav className={s.variants} aria-label="Варианты товара">
                {props.siblingOffers.map((item) => (
                  <LinkTypography key={item.uuid}>
                    <Link href={`/offers/${item.uuid}`} aria-current={item.uuid === offer.uuid ? 'page' : undefined}>
                      <Badge label={item.variant.name} color={item.uuid === offer.uuid ? 'blue' : 'gray'} size="md" />
                    </Link>
                  </LinkTypography>
                ))}
              </nav>
            ) : null}
            <div className={offer.records.length === 1 ? s.singlePurchase : s.purchase}>
              <Typography size="h6" weight="semi-bold">
                <p className={s.price}>{formatPrice(offer)}</p>
              </Typography>
              {props.purchase}
            </div>
            {offer.product.description || offer.variant.description ? (
              <section className={s.description} aria-label="Описание товара">
                <Typography size="body-s" weight="regular">
                  {offer.product.description ? <p className={s.paragraph}>{offer.product.description}</p> : null}
                  {offer.variant.description && offer.variant.description !== offer.product.description ? (
                    <p className={s.paragraph}>{offer.variant.description}</p>
                  ) : null}
                </Typography>
              </section>
            ) : null}
          </div>
        </div>
      </Card>
      {hasProperties ? (
        <Card>
          <section className={s.attributes} aria-label="Атрибуты товара">
            <Typography size="h6" weight="semi-bold">
              <h2 className={s.title}>Характеристики</h2>
            </Typography>
            {offer.product.properties.length > 0 ? (
              <Properties title="Товар" fields={offer.product.properties} />
            ) : null}
            {offer.variant.properties.length > 0 ? (
              <Properties title="Вариант" fields={offer.variant.properties} />
            ) : null}
          </section>
        </Card>
      ) : null}
    </div>
  );
};
