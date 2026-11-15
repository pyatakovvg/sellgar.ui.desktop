import React from 'react';

import { ArrowRightSLineIcon } from '@sellgar/kit/icons';

import type { CategoryPathEntity } from '@library/domain';

import s from './default.module.scss';

interface IProps {
  paths: CategoryPathEntity[];
}

export const Categories: React.FC<IProps> = (props) => {
  if (props.paths.length === 0) return null;

  return (
    <section className={s.wrapper} aria-label="Категории товара">
      <h2 className={s.title}>Категории товара</h2>
      <ul className={s.paths}>
        {props.paths.map((path) => (
          <li key={path.categoryUuid}>
            <ol className={s.path}>
              {path.items.map((item, index) => (
                <li key={item.uuid} className={s.node}>
                  {index > 0 ? <ArrowRightSLineIcon className={s.separator} aria-hidden="true" /> : null}
                  <span className={s.name}>{item.name}</span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  );
};
