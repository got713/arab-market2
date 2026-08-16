import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 fade-in space-y-8 text-sm text-gray-600 leading-relaxed">
      <div className="text-center space-y-3">
        <FileText className="w-12 h-12 text-gold mx-auto" />
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">Terms of Service</h1>
        <p className="text-xs text-gray-400">Last updated: August 13, 2026</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">1. Agreement to Terms</h2>
          <p>
            By accessing the Arab Market storefront or placing an order, you agree to comply with and be bound by these Terms of Service. These terms constitute a legally binding agreement between you and Arab Market LLC.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">2. Product Purchases and Tier Pricing</h2>
          <p>
            Customers can purchase items under Single, Pack, or Case structures. We reserve the right to modify prices, discount parameters, and stock counts without notice. Perishable goods will be shipped under temperature-controlled protocols.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">3. Delivery & ZIP Limitations</h2>
          <p>
            Delivery availability is calculated dynamically based on input ZIP codes. We ship exclusively to the United States. Perishable items are subject to specific dispatch cutoffs (Monday through Thursday) to guarantee fresh arrivals.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-dark">4. Payments</h2>
          <p>
            Payment card transactions are processed securely by Stripe. An order is marked as paid only once Stripe confirms the charge has succeeded; if a payment fails or is declined, the order remains unpaid and no charge is made.
          </p>
        </div>
      </div>
    </div>
  );
}
