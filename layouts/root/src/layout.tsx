import { Heading } from '@library/kit';

import React from 'react';

import s from './default.module.scss';

export const Layout: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <main className={s.wrapper}>
      <header className={s.header}>
        <Heading>
          <p>header</p>
        </Heading>
      </header>
      <section className={s.content}>{props.children}</section>
      <footer className={s.footer}>
        <p>footer</p>
      </footer>
    </main>
  );
};
