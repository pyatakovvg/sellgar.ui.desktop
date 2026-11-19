import React from 'react';

import { Typography } from '@sellgar/kit';

import type { ProductFieldEntity } from '@library/domain';

import s from './default.module.css';
import { Property } from './property';

interface IProps {
  title: string;
  fields: ProductFieldEntity[];
}

export const Properties: React.FC<IProps> = (props) => {
  return (
    <section className={s.wrapper}>
      <Typography size="body-s" weight="medium">
        <h3 className={s.title}>{props.title}</h3>
      </Typography>
      <dl className={s.fields}>
        {props.fields.map((field) => (
          <Property key={field.propertyCode} field={field} />
        ))}
      </dl>
    </section>
  );
};
