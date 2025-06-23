import { getCachedSession } from '@/lib/cache_server_route_data';
import { redirect } from 'next/navigation';
import Drive from '~/components/pages/drive/Drive';

export default async function Home() {
  const session = await getCachedSession();
  if (!session) redirect('/login');

  if (!session.user.is_approved) return <div>Please wait for admin approval</div>;

  return <Drive />;
}

export const metadata = {
  title: 'Drive'
};
