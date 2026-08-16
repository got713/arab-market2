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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_TITLE = 'عرب ماركت | Arab Market — Middle Eastern Groceries Delivered Across America';
const SITE_DESCRIPTION =
  'تسوق أفضل المنتجات العربية والشرق أوسطية — بقالة، حلويات، مشروبات، توابل، ومستلزمات منزلية. توصيل لكل أمريكا. Shop authentic Middle Eastern groceries delivered across America.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Arab Market',
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Arab Market',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
    alternateLocale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
