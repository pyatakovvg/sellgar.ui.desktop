'use client';
import React from 'react';
import { useLoaderData } from '@sellgar/app/next';
import { HomeComponent } from '@page/home';
import { CatalogControllerInterface } from '../classes/controller/catalog/catalog-controller.interface';
export const ModuleView: React.FC = () => {
  const data = useLoaderData(CatalogControllerInterface);
  return <HomeComponent {...data} />;
};
