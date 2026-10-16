import { Heading, Text } from '@library/kit';
import React from 'react';

import type { StorefrontOfferInput } from '../input/storefront-offer.input.ts';
import { Card } from './card';
import s from './default.module.scss';

interface IProps {
  products: StorefrontOfferInput[];
  failedToLoad?: boolean;
}

export const HomeComponent: React.FC<IProps> = (props) => {
  return (
    <div className={s.page}>
      <section className={s.summary}>
        <div>
          <Heading>
            <h1>Каталог товаров</h1>
          </Heading>
          <Text>
            <p>Доступные позиции магазина</p>
          </Text>
        </div>
        <span className={s.counter}>{props.products.length}</span>
      </section>
      {props.failedToLoad || props.products.length === 0 ? (
        <section className={s.status}>
          <Heading variant={'h4'}>
            <h2>{props.failedToLoad ? 'Не удалось загрузить товары' : 'Товаров пока нет'}</h2>
          </Heading>
          <Text>
            <p>{props.failedToLoad ? 'Попробуйте обновить страницу позже' : 'На витрине нет активных позиций'}</p>
          </Text>
        </section>
      ) : (
        <section className={s.grid}>
          {props.products.map((offer) => (
            <Card key={offer.offerUuid} offer={offer} />
          ))}
        </section>
      )}
    </div>
  );
};
