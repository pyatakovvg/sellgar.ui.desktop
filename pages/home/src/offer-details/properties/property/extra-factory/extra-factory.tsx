import React from 'react';

import type { StorefrontFieldInput } from '../../../../input/storefront-field.input.ts';
import s from './default.module.scss';

interface IProps {
  extra: StorefrontFieldInput['property']['options'][number]['extras'][number];
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
      return props.extra.imageUrl ? <img className={s.image} src={props.extra.imageUrl} alt={''} /> : null;
    case 'TEXT':
      return props.extra.valueText ? <span className={s.text}>{props.extra.valueText}</span> : null;
  }
};
