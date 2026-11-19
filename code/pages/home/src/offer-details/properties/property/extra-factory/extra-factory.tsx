import React from 'react';

import { Image, Typography } from '@sellgar/kit';

import type { ProductFieldEntity } from '@library/domain';

import s from './default.module.css';

interface IProps {
  extra: ProductFieldEntity['property']['options'][number]['extras'][number];
}

export const ExtraFactory: React.FC<IProps> = (props) => {
  switch (props.extra.type) {
    case 'COLOR':
      return props.extra.valueColor ? (
        <svg className={s.color} viewBox={'0 0 20 20'} aria-hidden={true}>
          <circle cx={10} cy={10} r={9} fill={props.extra.valueColor} />
        </svg>
      ) : null;
    case 'IMAGE':
      return props.extra.imageUrl ? (
        <Image src={props.extra.imageUrl} width={24} height={24} fit="contain" aria-hidden={true} />
      ) : null;
    case 'TEXT':
      return props.extra.valueText ? (
        <Typography size="caption-m" weight="regular">
          <span className={s.text}>{props.extra.valueText}</span>
        </Typography>
      ) : null;
  }
};
