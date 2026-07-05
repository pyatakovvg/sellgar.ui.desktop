import { OfferDetailsComponent } from '@page/home';
import type { StorefrontOfferDetailsResult, StorefrontProduct } from '@page/home';

export const dynamic = 'force-dynamic';

const CLIENT_GATEWAY_URL =
  process.env.CLIENT_GATEWAY_URL ?? process.env.NEXT_PUBLIC_CLIENT_GATEWAY_URL ?? 'http://localhost:4030';

interface IProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default async function OfferDetailsPage(props: IProps) {
  const { uuid } = await props.params;
  const result = await getOfferDetails(uuid);

  return (
    <OfferDetailsComponent
      offer={result.offer}
      siblingOffers={result.siblingOffers}
      failedToLoad={result.failedToLoad}
    />
  );
}

async function getOfferDetails(uuid: string) {
  try {
    const response = await fetch(`${CLIENT_GATEWAY_URL}/v1/offers/${uuid}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { offer: null, siblingOffers: [], failedToLoad: response.status >= 500 };
    }

    const result = (await response.json()) as StorefrontOfferDetailsResult;

    return {
      offer: normalizeImageUrls(result.offer),
      siblingOffers: normalizeImageUrls(result.siblingOffers ?? []),
      failedToLoad: false,
    };
  } catch {
    return { offer: null, siblingOffers: [], failedToLoad: true };
  }
}

function normalizeImageUrls(product: StorefrontProduct): StorefrontProduct;
function normalizeImageUrls(products: StorefrontProduct[]): StorefrontProduct[];
function normalizeImageUrls(value: StorefrontProduct | StorefrontProduct[]) {
  if (Array.isArray(value)) {
    return value.map((product) => normalizeImageUrls(product));
  }

  return {
    ...value,
    variant: {
      ...value.variant,
      images: value.variant.images.map((image) => ({
        ...image,
        imageUrl: new URL(image.imageUrl, CLIENT_GATEWAY_URL).toString(),
      })),
    },
  };
}
