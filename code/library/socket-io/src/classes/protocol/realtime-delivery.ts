import { isDateString, isUUID } from 'class-validator';

export type RealtimeChannel = 'offers' | 'products' | 'categories' | 'carts';

export interface RealtimeDelivery<TPayload = unknown> {
  readonly channel: RealtimeChannel;
  readonly deliveryId: string;
  readonly eventType: string;
  readonly expiresAt: string;
  readonly occurredAt: string;
  readonly payload: TPayload;
  readonly schemaVersion: number;
  readonly sequence: string;
}

const REALTIME_CHANNELS: readonly RealtimeChannel[] = ['offers', 'products', 'categories', 'carts'];

export const parseRealtimeDelivery = (value: unknown): RealtimeDelivery => {
  if (!isRecord(value)) {
    throw new Error('Realtime delivery must be an object.');
  }

  if (!REALTIME_CHANNELS.includes(value.channel as RealtimeChannel)) {
    throw new Error('Realtime delivery has an invalid channel.');
  }

  if (typeof value.deliveryId !== 'string' || !isUUID(value.deliveryId)) {
    throw new Error('Realtime delivery has an invalid deliveryId.');
  }

  if (typeof value.sequence !== 'string' || !/^\d+$/.test(value.sequence)) {
    throw new Error('Realtime delivery has an invalid sequence.');
  }

  if (typeof value.eventType !== 'string' || value.eventType.length === 0) {
    throw new Error('Realtime delivery has an invalid eventType.');
  }

  if (!Number.isInteger(value.schemaVersion) || Number(value.schemaVersion) < 1) {
    throw new Error('Realtime delivery has an invalid schemaVersion.');
  }

  if (
    typeof value.occurredAt !== 'string' ||
    typeof value.expiresAt !== 'string' ||
    !isDateString(value.occurredAt) ||
    !isDateString(value.expiresAt)
  ) {
    throw new Error('Realtime delivery has invalid dates.');
  }

  return {
    channel: value.channel as RealtimeChannel,
    deliveryId: value.deliveryId,
    eventType: value.eventType,
    expiresAt: value.expiresAt,
    occurredAt: value.occurredAt,
    payload: value.payload,
    schemaVersion: value.schemaVersion as number,
    sequence: value.sequence,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};
