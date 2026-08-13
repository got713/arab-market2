import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 fade-in space-y-8 text-sm text-gray-600 leading-relaxed">
      <div className="text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-gold mx-auto" />
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">Privacy Policy</h1>
        <p className="text-xs text-gray-400">Last updated: August 13, 2026</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, make a purchase, or contact customer support. This includes your name, email address, phone number, shipping address, and payment card details (which are processed securely via third-party providers).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">2. How We Use Your Information</h2>
          <p>
            We use your personal data to fulfill order invoices, coordinate delivery shipments with USPS/FedEx, apply promotional coupon discounts, send customer support responses, and personalize your storefront shopping experience.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">3. Cookies and Local Storage</h2>
          <p>
            Our web application uses standard browser cookies and local storage state (Zustand persists) to keep you logged into your account, remember products saved in your shopping cart or wishlist, and store your preferred language setting LTR or RTL.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">4. Secure Payment Processing</h2>
          <p>
            All payment gateway transactions are handled securely by PCI-compliant partners. For this functional demo session, card credentials are validated locally using simulated scripts, and no real monetary charges are executed.
          </p>
        </div>
      </div>
    </div>
  );
}
