import { Typography, Badge } from '@sellgar/kit';
import React from 'react';
import Link from 'next/link';

import type { StoreOfferEntity } from '@library/domain';
import { formatPrice, getInitials, getPreviewImage } from '../../formatter/offer.formatter.ts';
import s from './default.module.scss';

interface IProps {
  offer: StoreOfferEntity;
}

export const Card: React.FC<IProps> = (props) => {
  const image = getPreviewImage(props.offer);
  const description = props.offer.variant.description || props.offer.product.description;
  const available = props.offer.records.some((record) => record.inventory.available > 0);
  return (
    <Link className={s.card} href={`/offers/${props.offer.uuid}`}>
      <div className={s.preview}>
        {image ? (
          <img className={s.image} src={image.imageUrl} alt={image.fileName || props.offer.variant.name} />
        ) : (
          <span>{getInitials(props.offer.product.name)}</span>
        )}
      </div>
      <div className={s.body}>
        {props.offer.brand ? <span className={s.brand}>{props.offer.brand.name}</span> : null}
        <Typography size="h6" weight="semi-bold">
          <h2 className={s.title}>{props.offer.product.name}</h2>
        </Typography>
        <span className={s.variant}>{props.offer.variant.name}</span>
        {description ? (
          <Typography size="caption-l" weight="regular">
            <p className={s.description}>{description}</p>
          </Typography>
        ) : null}
        <div className={s.footer}>
          <span className={s.price}>{formatPrice(props.offer)}</span>
          <Badge color={available ? 'green' : 'gray'} label={available ? 'В наличии' : 'Нет в наличии'} size="sm" />
        </div>
      </div>
    </Link>
  );
};
