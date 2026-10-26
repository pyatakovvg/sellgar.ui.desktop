'use client';
import React from 'react';
import Link from 'next/link';
import { Typography } from '@sellgar/kit';
import type { LayoutViewProps } from '@sellgar/app/next';

import s from './default.module.scss';

export const LayoutView: React.FC<LayoutViewProps> = (props) => {
  return (
    <main className={s.wrapper}>
      <header className={s.header}>
        <Typography size="h6" weight="semi-bold">
          <span className={s.logo}>Sellgar</span>
        </Typography>
        <nav className={s.nav}>
          <Link href="/">Каталог</Link>
          <Link href="/">Новинки</Link>
          <Link href="/">Контакты</Link>
        </nav>
      </header>
      <section className={s.content}>{props.children}</section>
      <footer className={s.footer}>
        <span>Sellgar marketplace</span>
      </footer>
    </main>
  );
};
