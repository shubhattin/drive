import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCachedSession } from '@/lib/cache_server_route_data';
import Login from './Login';

const LoginPage = async () => {
  const session = await getCachedSession();
  if (session) redirect('/');

  return <Login />;
};

export const metadata: Metadata = {
  title: 'Login'
};

export default LoginPage;
