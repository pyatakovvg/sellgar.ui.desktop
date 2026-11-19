'use client';

import React from 'react';

import { useApplicationState } from '@sellgar/app/next';
import { Badge, Button, Popover } from '@sellgar/kit';
import { ShoppingCart2LineIcon } from '@sellgar/kit/icons';

import { CartApplicationState } from '../../cart.state';
import { Content } from './content';

export const CartControl: React.FC = () => {
  const state = useApplicationState(CartApplicationState);
  const [open, setOpen] = React.useState(false);
  const quantity = state.cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger>
        <Button
          type="button"
          style="ghost"
          size="md"
          leadIcon={<ShoppingCart2LineIcon />}
          badge={quantity > 0 ? <Badge label={quantity} color="blue" size="xs" shape="pill" /> : undefined}
          aria-label={quantity > 0 ? `Корзина, товаров: ${quantity}` : 'Корзина'}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          Корзина
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Content onClose={() => setOpen(false)} />
      </Popover.Content>
    </Popover>
  );
};
