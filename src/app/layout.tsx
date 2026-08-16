import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import LocaleProvider from '@/components/layout/locale-provider';
import LayoutWrapper from '@/components/layout/layout-wrapper';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'عرب ماركت | Arab Market — Middle Eastern Groceries Delivered Across America',
  description: 'تسوق أفضل المنتجات العربية والشرق أوسطية — بقالة، حلويات، مشروبات، توابل، ومستلزمات منزلية. توصيل لكل أمريكا. Shop authentic Middle Eastern groceries delivered across America.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
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
