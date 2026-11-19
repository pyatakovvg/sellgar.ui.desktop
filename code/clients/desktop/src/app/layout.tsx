import '@sellgar/kit/inter.css';
import '@sellgar/kit/geologica.css';
import '@sellgar/kit/theme.css';
import '../styles/global.css';

import type { Metadata } from 'next';
import React from 'react';

import { withLayout } from '@sellgar/app/next';

export const metadata: Metadata = { title: 'Sellgar', description: 'Интернет магазин' };

const StorefrontLayout = withLayout(() => import('@layout/root'));

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="ru" data-theme="light">
      <body>
        <StorefrontLayout>{children}</StorefrontLayout>
      </body>
    </html>
  );
}
