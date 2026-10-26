import React from 'react';

import type { ProductFieldEntity } from '@library/domain';
import { Property } from './property';
import s from './default.module.scss';

interface IProps {
  title: string;
  fields: ProductFieldEntity[];
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
