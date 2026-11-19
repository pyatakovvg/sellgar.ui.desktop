import type { DeviceServiceInterface } from '@library/domain';

export const DEVICE_COOKIE = 'sellgar.deviceUuid';

export class BrowserDeviceService implements DeviceServiceInterface {
  constructor(private readonly requestUuid?: string) {}

  getUniqueId(): string {
    if (this.requestUuid) return this.requestUuid;

    const cookie =
      typeof document === 'undefined'
        ? undefined
        : document.cookie
            .split(';')
            .map((value) => value.trim())
            .find((value) => value.startsWith(`${DEVICE_COOKIE}=`))
            ?.slice(DEVICE_COOKIE.length + 1);
    const stored = localStorage.getItem(DEVICE_COOKIE);
    const uuid = cookie || stored || crypto.randomUUID();

    localStorage.setItem(DEVICE_COOKIE, uuid);
    if (!cookie && typeof document !== 'undefined') {
      document.cookie = `${DEVICE_COOKIE}=${uuid}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    }

    return uuid;
  }
}
