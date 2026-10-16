import { Heading, Text } from '@library/kit';
import React from 'react';

import type { StorefrontOfferInput } from '../../input/storefront-offer.input.ts';
import { formatPrice, getInitials, getPreviewImage } from '../../formatter/offer.formatter.ts';
import s from './default.module.scss';

interface IProps {
  offer: StorefrontOfferInput;
}

export const Card: React.FC<IProps> = (props) => {
  const image = getPreviewImage(props.offer);
  const available = props.offer.records.some((record) => record.inventory.available > 0);
  return (
    <a className={s.card} href={`/offers/${props.offer.offerUuid}`}>
      <div className={s.preview}>
        {image ? (
          <img className={s.image} src={image.imageUrl} alt={image.fileName || props.offer.name} />
        ) : (
          <span>{getInitials(props.offer.product.name)}</span>
        )}
      </div>
      <div className={s.body}>
        {props.offer.brand ? <span className={s.brand}>{props.offer.brand.name}</span> : null}
        <Heading variant={'h4'}>
          <h2 className={s.title}>{props.offer.product.name}</h2>
        </Heading>
        <span className={s.variant}>{props.offer.variant.name}</span>
        {props.offer.description ? (
          <Text variant={'compact'}>
            <p className={s.description}>{props.offer.description}</p>
          </Text>
        ) : null}
        <div className={s.footer}>
          <span className={s.price}>{formatPrice(props.offer)}</span>
          <span className={s.availability}>{available ? 'В наличии' : 'Нет в наличии'}</span>
        </div>
      </div>
    </a>
  );
};
