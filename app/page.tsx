import { getSessionUser } from './auth';
import AnonymousBoard from './anonymous-board';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getSessionUser();
  return <AnonymousBoard signedIn={Boolean(user)} />;
}

