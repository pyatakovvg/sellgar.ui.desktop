import { withModule } from '@sellgar/app/next';

export const dynamic = 'force-dynamic';

export default withModule(() => import('@module/catalog'));
