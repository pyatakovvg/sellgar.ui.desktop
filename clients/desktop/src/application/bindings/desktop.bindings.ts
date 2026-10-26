import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { DomainBinding } from '@library/domain';

export class DesktopBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    const publicUrl = process.env.NEXT_PUBLIC_CLIENT_GATEWAY_URL ?? 'http://localhost:4030';
    const url = typeof window === 'undefined' ? (process.env.CLIENT_GATEWAY_URL ?? publicUrl) : publicUrl;

    new DomainBinding(url).register(registry);
  }
}
