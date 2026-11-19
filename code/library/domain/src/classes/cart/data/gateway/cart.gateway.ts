import { type ClassConstructor, plainToInstance } from 'class-transformer';
import { isUUID, validateOrReject } from 'class-validator';

import { Inject, Injectable, RequestExecutorInterface } from '@sellgar/app';

import { resolveGatewayUrl } from '@library/domain/gateway-url';

import { ConfigInterface } from '../../../../infrastructure/config/config.interface.ts';
import { HttpClientInterface } from '../../../../infrastructure/http-client/http-client.interface.ts';
import type { HttpRequestInput } from '../../../../infrastructure/http-client/http-request.input.ts';
import { CartEntity } from '../../domain/cart.entity.ts';
import { CartItemMutationEntity } from '../../domain/cart-item-mutation.entity.ts';
import { CartGatewayInterface } from './cart-gateway.interface.ts';
import { AddCartItemDto } from './dto/add-cart-item.dto.ts';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto.ts';
import { SetCartItemQuantityDto } from './dto/set-cart-item-quantity.dto.ts';
import type { AddCartItemInput } from './input/add-cart-item.input.ts';
import type { SetCartItemQuantityInput } from './input/set-cart-item-quantity.input.ts';

@Injectable()
export class CartGateway implements CartGatewayInterface {
  constructor(
    @Inject(ConfigInterface) private readonly config: ConfigInterface,
    @Inject(HttpClientInterface) private readonly http: HttpClientInterface,
    @Inject(RequestExecutorInterface) private readonly requests: RequestExecutorInterface,
  ) {}

  async get(signal?: AbortSignal): Promise<CartEntity> {
    const result = await this.request('/v1/cart', { method: 'GET', signal }, 'cart:get');

    const cart = await this.toEntity(CartEntity, result);

    for (const item of cart.items) {
      item.imageUrl = item.imageUuid
        ? resolveGatewayUrl(`/v1/files/${item.imageUuid}`, this.config.getPublicGatewayUrl()).toString()
        : null;
    }

    return cart;
  }

  async addItem(input: AddCartItemInput, signal?: AbortSignal): Promise<CartItemMutationEntity> {
    const dto = await this.toEntity(AddCartItemDto, input);
    const result = await this.request(
      '/v1/cart/items',
      { method: 'POST', body: dto, signal },
      `cart:add:${dto.recordUuid}`,
    );

    return this.toEntity(CartItemMutationEntity, result);
  }

  async setItemQuantity(
    recordUuid: string,
    input: SetCartItemQuantityInput,
    signal?: AbortSignal,
  ): Promise<CartItemMutationEntity> {
    this.validateRecordUuid(recordUuid);
    const dto = await this.toEntity(SetCartItemQuantityDto, input);
    const result = await this.request(
      `/v1/cart/items/${recordUuid}`,
      { method: 'PATCH', body: dto, signal },
      `cart:set-quantity:${recordUuid}`,
    );

    return this.toEntity(CartItemMutationEntity, result);
  }

  async removeItem(recordUuid: string, version: string, signal?: AbortSignal): Promise<CartItemMutationEntity> {
    this.validateRecordUuid(recordUuid);
    const dto = await this.toEntity(RemoveCartItemDto, { version });
    const result = await this.request(
      `/v1/cart/items/${recordUuid}`,
      { method: 'DELETE', body: dto, signal },
      `cart:remove:${recordUuid}`,
    );

    return this.toEntity(CartItemMutationEntity, result);
  }

  private request(path: string, input: HttpRequestInput, scope: string): Promise<unknown> {
    return this.requests.run({ scope }, (request) =>
      this.http.request(resolveGatewayUrl(path, this.config.getGatewayUrl()), {
        ...input,
        withSession: true,
        signal: input.signal ? AbortSignal.any([input.signal, request.signal]) : request.signal,
      }),
    );
  }

  private validateRecordUuid(recordUuid: string): void {
    if (!isUUID(recordUuid)) throw new Error('Не задана учётная запись товара');
  }

  private async toEntity<T extends object>(type: ClassConstructor<T>, value: unknown): Promise<T> {
    const entity = plainToInstance(type, value, { excludeExtraneousValues: true });

    await validateOrReject(entity);

    return entity;
  }
}
