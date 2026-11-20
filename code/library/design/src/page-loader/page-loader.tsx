'use client';

import React from 'react';

import { Spinner, Typography } from '@sellgar/kit';

import s from './default.module.css';

export const PageLoader: React.FC = () => {
  return (
    <div className={s.wrapper} role="status" aria-live="polite">
      <Spinner />
      <Typography size="caption-l" weight="regular">
        <span>Загрузка страницы…</span>
      </Typography>
    </div>
  );
};
