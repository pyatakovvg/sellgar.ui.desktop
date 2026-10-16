import { OfferDetailsComponent } from '@page/home';
import { storefrontGateway } from '../../../server/storefront';

export const dynamic = 'force-dynamic';

interface IProps {
  params: Promise<{ uuid: string }>;
}

export default async function OfferDetailsPage(props: IProps) {
  const { uuid } = await props.params;
  const result = await storefrontGateway.getByUuid(uuid);
  return (
    <OfferDetailsComponent
      offer={result.offer}
      siblingOffers={result.siblingOffers}
      failedToLoad={result.failedToLoad}
    />
  );
}
