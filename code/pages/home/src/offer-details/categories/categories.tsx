import React from 'react';

import { Breadcrumb } from '@sellgar/kit';

import type { CategoryPathEntity } from '@library/domain';

import s from './default.module.css';

interface IProps {
  paths: CategoryPathEntity[];
  name: string;
}

export const Categories: React.FC<IProps> = (props) => {
  return (
    <nav className={s.wrapper} aria-label="Хлебные крошки">
      {props.paths.length > 0 ? (
        props.paths.map((path) => (
          <Breadcrumb
            key={path.categoryUuid}
            wrap={true}
            items={[{ label: 'Каталог', href: '/' }, ...path.items.map((item) => ({ label: item.name }))]}
          />
        ))
      ) : (
        <Breadcrumb wrap={true} items={[{ label: 'Каталог', href: '/' }, { label: props.name }]} />
      )}
    </nav>
  );
};
