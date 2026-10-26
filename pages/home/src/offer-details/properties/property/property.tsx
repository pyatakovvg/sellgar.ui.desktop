import React from 'react';

import type { ProductFieldEntity } from '@library/domain';
import { formatPropertyValue } from './formatter/property-value.formatter.ts';
import { ExtraFactory } from './extra-factory';
import s from './default.module.scss';

interface IProps {
  field: ProductFieldEntity;
}

export const Property: React.FC<IProps> = (props) => {
  const options = props.field.property.options;
  return (
    <div className={s.wrapper}>
      <dt className={s.label}>{props.field.property.name}</dt>
      <dd className={s.values}>
        {props.field.values.length === 0 ? (
          <span>Не указано</span>
        ) : props.field.property.kind === 'OPTIONS' ? (
          props.field.values
            .filter((value) => value.valueOptionCode !== null)
            .map((value) => {
              const option = options.find((item) => item.code === value.valueOptionCode);
              return (
                <span key={value.valueOptionCode} className={s.option}>
                  {option?.extras.map((extra) => (
                    <ExtraFactory key={`${extra.type}:${extra.sortOrder}`} extra={extra} />
                  ))}
                  <span>{option?.name ?? 'Значение недоступно'}</span>
                </span>
              );
            })
        ) : (
          <span>
            {props.field.values
              .map((value) => formatPropertyValue(props.field.property.kind, value))
              .filter((value) => value !== '')
              .join(', ') || 'Не указано'}
          </span>
        )}
        {props.field.property.unitCode ? <span className={s.unit}>{props.field.property.unitCode}</span> : null}
      </dd>
    </div>
  );
};
