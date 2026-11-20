'use client';

import React from 'react';

import { Link, useApplicationState, useReadyApplication } from '@sellgar/app/next';
import { QuantityStepper } from '@sellgar/kit';
import { ImageLineIcon } from '@sellgar/kit/icons';

import { Image } from '@library/design';
import type { CartItemEntity } from '@library/domain';

import { CartApplicationState } from '../../../../cart.state';
import { CartWidgetServiceInterface } from '../../../../cart-service.interface';
import { formatMoney } from '../../formatter/cart.formatter';
import s from './default.module.css';

interface IProps {
  item: CartItemEntity;
  currencyCode: string;
  onNavigate(): void;
  onRemoved(): void;
}

export const Item: React.FC<IProps> = (props) => {
  const state = useApplicationState(CartApplicationState);
  const ready = useReadyApplication();
  const item = props.item;
  const name = item.productName ?? 'Товар';
  const parameters = [item.variantName, ...item.clarifications].filter(Boolean).join(' · ');
  const active = state.activeRecordUuid === item.recordUuid;
  const loading = state.busy && active;
  const canDecrease = item.quantity === 1 ? item.canRemove : item.canDecrease;
  const changeQuantity = (quantity: number) => {
    if (state.busy) return;

    void ready()
      .then((app) => app.getDependency(CartWidgetServiceInterface).setQuantity(item.recordUuid, quantity))
      .then(() => {
        if (quantity === 0) props.onRemoved();
      })
      .catch(() => undefined);
  };

  return (
    <li className={s.wrapper}>
      <div className={s.preview} aria-hidden="true">
        {item.imageUrl ? <Image src={item.imageUrl} sizes="48px" alt="" /> : <ImageLineIcon />}
      </div>
      <div className={s.details}>
        {item.canOpenProduct && item.offerUuid ? (
          <Link className={s.name} title={name} href={`/offers/${item.offerUuid}`} onClick={props.onNavigate}>
            {name}
          </Link>
        ) : (
          <span className={s.name} title={name}>
            {name}
          </span>
        )}
        {parameters ? (
          <p className={s.caption} title={parameters}>
            {parameters}
          </p>
        ) : null}
        {item.message ? <p className={s.message}>{item.message}</p> : null}
      </div>
      <div className={s.purchase}>
        <span className={s.amount}>{formatMoney(item.subtotal, props.currencyCode)}</span>
        <div className={s.quantity}>
          <div
            className={s.counter}
            role="spinbutton"
            tabIndex={0}
            aria-label={`Количество ${name}${parameters ? `. ${parameters}` : ''} в корзине`}
            aria-valuenow={item.quantity}
            aria-valuemin={0}
            aria-valuemax={Math.max(item.quantity, item.availableQuantity ?? item.quantity)}
            aria-disabled={state.busy || (!canDecrease && !item.canIncrease)}
            aria-busy={loading}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                if (event.key === 'ArrowUp' && item.canIncrease) changeQuantity(item.quantity + 1);

                if (event.key === 'ArrowDown' && canDecrease) changeQuantity(item.quantity - 1);
              }
            }}
          >
            <QuantityStepper
              size="sm"
              outline={true}
              value={item.quantity}
              leftActionType={item.quantity === 1 ? 'delete' : 'subtract'}
              leftActionDisabled={!canDecrease || (state.busy && !active)}
              rightActionDisabled={!item.canIncrease || (state.busy && !active)}
              loadingAction={loading ? (state.pendingAction === 'decrease' ? 'left' : 'right') : undefined}
              onLeftActionClick={() => {
                if (canDecrease) changeQuantity(item.quantity - 1);
              }}
              onRightActionClick={() => {
                if (item.canIncrease) changeQuantity(item.quantity + 1);
              }}
            />
          </div>
          <span className={s['unit-price']}>
            × {item.price ? formatMoney(item.price.value, item.price.currencyCode) : 'цена уточняется'}
          </span>
        </div>
      </div>
      {active && state.error ? (
        <p className={s.error} role="alert">
          {state.error.message}
        </p>
      ) : null}
    </li>
  );
};
