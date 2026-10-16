import { HomeComponent } from '@page/home';
import { storefrontGateway } from '../server/storefront';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const result = await storefrontGateway.getAll();
  return <HomeComponent products={result.products} failedToLoad={result.failedToLoad} />;
}
