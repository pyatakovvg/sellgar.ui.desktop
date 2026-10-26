'use client';
import { Typography } from '@sellgar/kit';
import React from 'react';
import Link from 'next/link';

import type { StoreOfferEntity } from '@library/domain';
import { formatPrice, getInitials, getPreviewImage } from '../formatter/offer.formatter.ts';
import { Records } from './records';
import { Properties } from './properties';
import s from './default.module.scss';

interface IProps {
  offer?: StoreOfferEntity | null;
  siblingOffers: StoreOfferEntity[];
  failedToLoad?: boolean;
}

export const OfferDetailsComponent: React.FC<IProps> = (props) => {
  if (props.failedToLoad || !props.offer) {
    return (
      <div className={s.page}>
        <Link className={s.backLink} href={'/'}>
          Вернуться в каталог
        </Link>
        <section className={s.status}>
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
        </section>
      </div>
    );
  }

  const offer = props.offer;
  const image = getPreviewImage(offer);
  const otherOffers = props.siblingOffers.filter((item) => item.uuid !== offer.uuid);

  return (
    <div className={s.page}>
      <Link className={s.backLink} href={'/'}>
        Вернуться в каталог
      </Link>
      <section className={s.offerDetails}>
        <div className={s.offerPreview}>
          {image ? (
            <img className={s.image} src={image.imageUrl} alt={image.fileName || offer.variant.name} />
          ) : (
            <span>{getInitials(offer.product.name)}</span>
          )}
        </div>
        <div className={s.offerInfo}>
          {offer.brand ? <span className={s.brand}>{offer.brand.name}</span> : null}
          <Typography size="h4" weight="semi-bold">
            <h1 className={s.title}>{offer.product.name}</h1>
          </Typography>
          <Typography size="body-s" weight="regular">
            <p className={s.variant}>{offer.variant.name}</p>
          </Typography>
          {offer.product.description ? (
            <Typography size="body-s" weight="regular">
              <p className={s.description}>{offer.product.description}</p>
            </Typography>
          ) : null}
          {offer.variant.description && offer.variant.description !== offer.product.description ? (
            <Typography size="body-s" weight="regular">
              <p className={s.description}>{offer.variant.description}</p>
            </Typography>
          ) : null}
          <div className={s.price}>{formatPrice(offer)}</div>
          <Records key={offer.uuid} records={offer.records} />
          {offer.product.properties.length > 0 ? (
            <Properties title={'О товаре'} fields={offer.product.properties} />
          ) : null}
          {offer.variant.properties.length > 0 ? (
            <Properties title={'Об этом варианте'} fields={offer.variant.properties} />
          ) : null}
        </div>
      </section>
      {otherOffers.length > 0 ? (
        <section className={s.variantsSection}>
          <Typography size="h6" weight="semi-bold">
            <h2>Другие варианты товара</h2>
          </Typography>
          <div className={s.variantLinks}>
            {otherOffers.map((item) => (
              <Link key={item.uuid} className={s.variantLink} href={`/offers/${item.uuid}`}>
                <span className={s.variantName}>{item.variant.name}</span>
                <span className={s.variantPrice}>{formatPrice(item)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
