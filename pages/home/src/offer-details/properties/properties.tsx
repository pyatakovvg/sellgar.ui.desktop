import React from 'react';

import type { StorefrontFieldInput } from '../../input/storefront-field.input.ts';
import { Property } from './property';
import s from './default.module.scss';

interface IProps {
  title: string;
  fields: StorefrontFieldInput[];
}

export const Properties: React.FC<IProps> = (props) => {
  return (
    <section className={s.wrapper}>
      <h2 className={s.title}>{props.title}</h2>
      <dl className={s.fields}>
        {props.fields.map((field) => (
          <Property key={field.propertyCode} field={field} />
        ))}
      </dl>
    </section>
  );
};
