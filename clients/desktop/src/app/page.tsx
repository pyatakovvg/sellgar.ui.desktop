import { HomeComponent } from '@page/home';
import type { StorefrontProduct, StorefrontProductResult } from '@page/home';

export const dynamic = 'force-dynamic';

const CLIENT_GATEWAY_URL =
  process.env.CLIENT_GATEWAY_URL ?? process.env.NEXT_PUBLIC_CLIENT_GATEWAY_URL ?? 'http://localhost:4030';

export default async function Home() {
  const result = await getProducts();

  return <HomeComponent products={result.products} failedToLoad={result.failedToLoad} />;
}

async function getProducts() {
  try {
    const response = await fetch(`${CLIENT_GATEWAY_URL}/v1/products`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { products: [], failedToLoad: true };
    }

    const result = (await response.json()) as StorefrontProductResult;

    return {
      products: normalizeImageUrls(result.data ?? []),
      failedToLoad: false,
    };
  } catch {
    return { products: [], failedToLoad: true };
  }
}

function normalizeImageUrls(products: StorefrontProduct[]) {
  return products.map((product) => normalizeProductImageUrls(product));
}

function normalizeProductImageUrls(product: StorefrontProduct) {
  return {
    ...product,
    product: {
      ...product.product,
      properties: normalizePropertyMetadataImageUrls(product.product.properties),
    },
    variant: {
      ...product.variant,
      properties: normalizePropertyMetadataImageUrls(product.variant.properties),
      images: product.variant.images.map((image) => ({
        ...image,
        imageUrl: new URL(image.imageUrl, CLIENT_GATEWAY_URL).toString(),
      })),
    },
  };
}

function normalizePropertyMetadataImageUrls(properties: StorefrontProduct['product']['properties']) {
  return properties?.map((property) => ({
    ...property,
    option: property.option
      ? {
          ...property.option,
          metadata: property.option.metadata.map((metadata) => ({
            ...metadata,
            imageUrl: metadata.imageUrl ? new URL(metadata.imageUrl, CLIENT_GATEWAY_URL).toString() : metadata.imageUrl,
          })),
        }
      : property.option,
  }));
}
