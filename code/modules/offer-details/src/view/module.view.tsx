'use client';

import React from 'react';

import { useLoaderData } from '@sellgar/app/next';

import { OfferDetailsComponent } from '@page/home';

import { OfferDetailsControllerInterface } from '../classes/controller/offer-details/offer-details-controller.interface';
import { Purchase } from './purchase';

export const ModuleView: React.FC = () => {
  const data = useLoaderData(OfferDetailsControllerInterface);

  return <OfferDetailsComponent {...data} purchase={data.offer ? <Purchase /> : null} />;
};
