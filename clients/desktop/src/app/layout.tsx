import { Layout } from '@layout/root';
import '@library/kit/src/theme/index.css';

import React from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sellgar',
  description: 'Интернет магазин',
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="ru">
      <head></head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
};

export default RootLayout;
