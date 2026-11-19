import Link from 'next/link';
import React from 'react';

import { Badge, Image, Typography } from '@sellgar/kit';

import s from './default.module.css';

interface IProps {
  href: string;
  name: string;
  variantName: string;
  brandName?: string;
  imageUrl?: string;
  imagePlaceholder: string;
  price: string;
}

export const ProductCard: React.FC<IProps> = (props) => {
  const linkLabel = [props.name, props.brandName, props.variantName].filter(Boolean).join(' · ');

  return (
    <article className={s.wrapper}>
      <Link className={s.preview} href={props.href} aria-label={linkLabel}>
        {props.imageUrl ? (
          <Image src={props.imageUrl} width={192} height={192} fit="contain" aria-hidden={true} />
        ) : (
          <Typography size="body-l" weight="medium">
            <span aria-hidden={true}>{props.imagePlaceholder}</span>
          </Typography>
        )}
      </Link>
      <div className={s.body}>
        {props.brandName ? (
          <Typography size="caption-m" weight="regular">
            <div className={s.brand}>{props.brandName}</div>
          </Typography>
        ) : null}
        <Typography size="body-s" weight="semi-bold">
          <div>{props.price}</div>
        </Typography>
        <Typography size="caption-m" weight="regular">
          <h2 className={s.title}>
            <Link className={s.name} href={props.href} aria-label={linkLabel}>
              {props.name}
            </Link>
          </h2>
        </Typography>
        <div className={s.personalizations}>
          <Badge label={props.variantName} size="sm" color="blue" />
        </div>
      </div>
    </article>
  );
};
