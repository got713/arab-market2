import type { Metadata } from 'next';
import { Poppins, Cairo } from 'next/font/google';
import LocaleProvider from '@/components/layout/locale-provider';
import LayoutWrapper from '@/components/layout/layout-wrapper';
import './globals.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const cairo = Cairo({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'Arab Market | Authentic Arabic & Middle Eastern Groceries',
  description: 'Shop authentic Middle Eastern groceries, snacks, frozen foods, spices, sweets, and household essentials. Delivered across America.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-dark bg-white">
        <LocaleProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </LocaleProvider>
      </body>
    </html>
  );
}
