'use client';

import Link from 'next/link';
import React from 'react';

import { useApplicationState } from '@sellgar/app/next';
import { Button, Scrollbar } from '@sellgar/kit';
import { CloseLineIcon } from '@sellgar/kit/icons';

import { CartApplicationState } from '../../../cart.state';
import { formatMoney } from '../formatter/cart.formatter';
import s from './default.module.css';
import { Item } from './item';

interface IProps {
  onClose(): void;
}

export const Content: React.FC<IProps> = (props) => {
  const state = useApplicationState(CartApplicationState);
  const cart = state.cart;
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  return (
    <section className={s.wrapper} aria-label="Содержимое корзины">
      <div className={s.header}>
        <div className={s.heading}>
          <div className={s['title-row']}>
            <h2 className={s.title}>Корзина</h2>
          </div>
          {cart ? <p className={s.shop}>{cart.shop.name}</p> : null}
        </div>
        <Button.Icon
          ref={closeRef}
          type="button"
          style="ghost"
          leadIcon={<CloseLineIcon />}
          aria-label="Закрыть корзину"
          onClick={props.onClose}
        />
      </div>
      {state.failedToLoad ? (
        <p className={s.message} role="alert">
          Не удалось загрузить корзину. Обновите страницу и попробуйте снова.
        </p>
      ) : !cart ? (
        <p className={s.message} role="status">
          Обновляем корзину…
        </p>
      ) : cart.items.length === 0 ? (
        <div className={s.empty}>
          <p className={s['empty-title']}>В корзине пока пусто</p>
          <p className={s.message}>Добавьте товары из каталога — они появятся здесь.</p>
          <Link className={s.link} href="/" onClick={props.onClose}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className={s.contents}>
          <Scrollbar className={s.scroll} floatingHorizontalScrollbar={false}>
            <ul ref={listRef} className={s.items} tabIndex={0} aria-label="Товары в корзине">
              {cart.items.map((item) => (
                <Item
                  key={item.recordUuid}
                  item={item}
                  currencyCode={cart.currencyCode}
                  onNavigate={props.onClose}
                  onRemoved={() => (listRef.current ?? closeRef.current)?.focus()}
                />
              ))}
            </ul>
          </Scrollbar>
          <div className={s.total}>
            <span>Итого за товары</span>
            <strong className={s.amount}>{formatMoney(cart.itemsTotal, cart.currencyCode)}</strong>
          </div>
        </div>
      )}
    </section>
  );
};
