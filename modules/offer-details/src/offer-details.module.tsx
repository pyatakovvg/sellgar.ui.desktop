import React from 'react';
import { UseBindings } from '@sellgar/app';
import { Module } from '@sellgar/app/next';
import { OfferDetailsBindings } from './classes/classes.bindings';
import { ModuleView } from './view/module.view';
@UseBindings(OfferDetailsBindings)
@Module({
  view: ModuleView,
  fallback: <p role="status">Загрузка…</p>,
  exception: <p role="alert">Не удалось открыть страницу</p>,
})
export class OfferDetailsModule {}
