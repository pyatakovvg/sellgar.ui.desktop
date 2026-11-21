'use client';

import React from 'react';

import { useApplicationState, useLoaderData, useReadyApplication } from '@sellgar/app/next';

import { OfferPurchase } from '@page/home';
import { CartApplicationState, CartWidgetServiceInterface } from '@widget/cart';

import { OfferDetailsControllerInterface } from '../../classes/controller/offer-details/offer-details-controller.interface';

export const Purchase: React.FC = () => {
  const { offer } = useLoaderData(OfferDetailsControllerInterface);
  const state = useApplicationState(CartApplicationState);
  const ready = useReadyApplication();

  return (
    <OfferPurchase
      records={offer?.records ?? []}
      items={state.cart?.items}
      busy={state.busy}
      pendingAction={state.pendingAction}
      activeRecordUuid={state.activeRecordUuid}
      onChange={(recordUuid, quantity) => {
        if (!state.busy)
          void ready()
            .then((app) => app.getDependency(CartWidgetServiceInterface).setQuantity(recordUuid, quantity))
            .catch(() => undefined);
      }}
      error={state.error?.message}
      failedToLoad={state.failedToLoad}
    />
  );
};
