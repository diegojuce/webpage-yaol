import { CartProvider } from 'components/cart/cart-context';
import { Navbar } from 'components/layout/navbar';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
import { getCart } from 'lib/shopify';
import { baseUrl } from 'lib/utils';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  }
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-black text-white selection:bg-teal-300 dark:bg-black dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        {/* MANCHAS AMARILLAS */}
        <div
          className="absolute -top-40 left-2/3 h-72 w-72 rounded-full bg-yellow-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-48 -left-32 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl"
          aria-hidden="true"
        />
        <CartProvider cartPromise={cart}>
          <Navbar />
          <main>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
