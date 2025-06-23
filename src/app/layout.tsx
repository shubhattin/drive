import './globals.css';
import './app.scss';
import { ThemeProvider } from '@/components/theme-provider';
import { Roboto } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700']
});

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={cn(
          roboto.className,
          'antialiased',
          'overflow-y-scroll sm:px-2 lg:px-3 xl:px-4 2xl:px-4'
        )}
      >
        <ThemeProvider
          attribute={['class']}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="container mx-auto mb-1">
            <Toaster richColors={true} />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  },
  appleWebApp: {
    title: 'Drive',
    statusBarStyle: 'black-translucent'
  }
};
