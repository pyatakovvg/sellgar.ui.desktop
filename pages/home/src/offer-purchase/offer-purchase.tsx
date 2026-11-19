'use client';

import React from 'react';

import { Typography } from '@sellgar/kit';

import type { CartItemEntity, StoreAccountingRecordEntity } from '@library/domain';

import s from './default.module.css';
import { Record } from './record';

interface IProps {
  records: StoreAccountingRecordEntity[];
  items?: readonly CartItemEntity[];
  onChange?: (recordUuid: string, quantity: number) => void;
  pendingAction?: 'increase' | 'decrease' | null;
  busy?: boolean;
  disabled?: boolean;
  activeRecordUuid?: string | null;
  error?: string;
  failedToLoad?: boolean;
}

export const OfferPurchase: React.FC<IProps> = (props) => {
  return (
    <section className={s.wrapper} aria-label="Добавление товара в корзину">
      <div className={s.options}>
        {props.records.map((record) => (
          <Record
            key={record.uuid}
            record={record}
            single={props.records.length === 1}
            item={props.items?.find((item) => item.recordUuid === record.uuid)}
            loaded={props.items !== undefined}
            busy={props.busy}
            disabled={props.disabled}
            pendingAction={props.pendingAction}
            loading={props.busy === true && props.activeRecordUuid === record.uuid}
            error={props.activeRecordUuid === record.uuid ? props.error : undefined}
            onChange={props.onChange}
          />
        ))}
      </div>
      {props.records.length === 0 ? (
        <Typography size="caption-l" weight="regular">
          <p className={s.hint}>Нет в наличии</p>
        </Typography>
      ) : null}
      {props.failedToLoad ? (
        <Typography size="caption-l" weight="regular">
          <p className={s.error} role="alert">
            Не удалось обновить количество в корзине. Обновите страницу и попробуйте снова.
          </p>
        </Typography>
      ) : null}
    </section>
  );
};
