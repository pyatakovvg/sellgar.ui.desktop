'use client';
import { Typography, Badge } from '@sellgar/kit';
import React from 'react';

import type { StoreOfferEntity } from '@library/domain';
import { Card } from './card';
import s from './default.module.scss';

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
          {props.products.map((offer) => (
            <Card key={offer.uuid} offer={offer} />
          ))}
        </section>
      )}
    </div>
  );
};
