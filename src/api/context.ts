import { auth } from '@/lib/auth';

export const createContext = async ({ req }: { req: Request }) => {
  const session = await auth.api.getSession({ headers: req.headers });
  const user = session?.user;

  return {
    user
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
