import { Heading, Text } from '@library/kit';
import React from 'react';

import type { StorefrontOfferInput } from '../input/storefront-offer.input.ts';
import { formatPrice, getInitials, getPreviewImage } from '../formatter/offer.formatter.ts';
import { Records } from './records';
import { Properties } from './properties';
import s from './default.module.scss';

interface IProps {
  offer?: StorefrontOfferInput | null;
  siblingOffers: StorefrontOfferInput[];
  failedToLoad?: boolean;
}

export const OfferDetailsComponent: React.FC<IProps> = (props) => {
  if (props.failedToLoad || !props.offer) {
    return (
      <div className={s.page}>
        <a className={s.backLink} href={'/'}>
          Вернуться в каталог
        </a>
        <section className={s.status}>
          <Heading variant={'h4'}>
            <h1>{props.failedToLoad ? 'Не удалось загрузить предложение' : 'Предложение не найдено'}</h1>
          </Heading>
          <Text>
            <p>
              {props.failedToLoad
                ? 'Попробуйте обновить страницу позже'
                : 'На витрине нет такого активного предложения'}
            </p>
          </Text>
        </section>
      </div>
    );
  }

  const offer = props.offer;
  const image = getPreviewImage(offer);
  const otherOffers = props.siblingOffers.filter((item) => item.offerUuid !== offer.offerUuid);

  return (
    <div className={s.page}>
      <a className={s.backLink} href={'/'}>
        Вернуться в каталог
      </a>
      <section className={s.offerDetails}>
        <div className={s.offerPreview}>
          {image ? (
            <img className={s.image} src={image.imageUrl} alt={image.fileName || offer.name} />
          ) : (
            <span>{getInitials(offer.product.name)}</span>
          )}
        </div>
        <div className={s.offerInfo}>
          {offer.brand ? <span className={s.brand}>{offer.brand.name}</span> : null}
          <Heading>
            <h1 className={s.title}>{offer.product.name}</h1>
          </Heading>
          <Text>
            <p className={s.variant}>{offer.variant.name}</p>
          </Text>
          {offer.product.description ? (
            <Text>
              <p className={s.description}>{offer.product.description}</p>
            </Text>
          ) : null}
          {offer.variant.description && offer.variant.description !== offer.product.description ? (
            <Text>
              <p className={s.description}>{offer.variant.description}</p>
            </Text>
          ) : null}
          <div className={s.price}>{formatPrice(offer)}</div>
          <Records key={offer.offerUuid} records={offer.records} />
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
          <Heading variant={'h4'}>
            <h2>Другие варианты товара</h2>
          </Heading>
          <div className={s.variantLinks}>
            {otherOffers.map((item) => (
              <a key={item.offerUuid} className={s.variantLink} href={`/offers/${item.offerUuid}`}>
                <span className={s.variantName}>{item.variant.name}</span>
                <span className={s.variantPrice}>{formatPrice(item)}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
