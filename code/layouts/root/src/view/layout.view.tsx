'use client';

import React from 'react';

import { type LayoutViewProps, Link } from '@sellgar/app/next';
import { Scrollbar, Typography } from '@sellgar/kit';

import { CartControl } from '@widget/cart/control';

import s from './default.module.css';

export const LayoutView: React.FC<LayoutViewProps> = (props) => {
  return (
    <Scrollbar className={s.scroll} floatingHorizontalScrollbar={false}>
      <main className={s.wrapper}>
        <header className={s.header}>
          <Typography size="h6" weight="semi-bold">
            <span className={s.logo}>Sellgar</span>
          </Typography>
          <nav className={s.nav}>
            <Typography size="caption-l" weight="regular">
              <Link className={s.link} href="/">
                Каталог
              </Link>
              <Link className={s.link} href="/">
                Новинки
              </Link>
              <Link className={s.link} href="/">
                Контакты
              </Link>
            </Typography>
          </nav>
          <div className={s.cart}>
            <CartControl />
          </div>
        </header>
        <section className={s.content}>{props.children}</section>
        <footer className={s.footer}>
          <Typography size="caption-l" weight="regular">
            <span>Sellgar marketplace</span>
          </Typography>
        </footer>
      </main>
    </Scrollbar>
  );
};
