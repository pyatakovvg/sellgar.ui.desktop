import React from 'react';

import s from './default.module.scss';

export const Layout: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <main className={s.wrapper}>
      <header className={s.header}>
        <span className={s.logo}>Sellgar</span>
        <nav className={s.nav}>
          <a href="/">Каталог</a>
          <a href="/">Новинки</a>
          <a href="/">Контакты</a>
        </nav>
      </header>
      <section className={s.content}>{props.children}</section>
      <footer className={s.footer}>
        <span>Sellgar marketplace</span>
      </footer>
    </main>
  );
};
