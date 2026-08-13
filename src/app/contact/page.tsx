'use client';

import React, { useState } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { t, locale } = useLocaleStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 fade-in space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">{t('nav.contact')}</h1>
        <p className="text-xs sm:text-sm text-muted-text">
          Have a question about shipping rates, order status, or suggesting a Middle Eastern product? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
        {/* Info Column */}
        <div className="space-y-6 bg-cream/35 border border-light-border p-6 rounded-xl">
          <h2 className="font-bold text-sm text-primary uppercase tracking-wider mb-4">
            Support Desk Channels
          </h2>

          <div className="flex items-start gap-3.5 text-xs text-gray-600">
            <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-dark block font-semibold">Email support</strong>
              <a href="mailto:support@arabmarket.com" className="hover:underline">support@arabmarket.com</a>
              <span className="block text-[10px] text-gray-400 mt-0.5">Average response: &lt; 3 hours</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 text-xs text-gray-600">
            <Phone className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-dark block font-semibold">Phone support</strong>
              <a href="tel:+18005550100" className="hover:underline">+1 (800) 555-0100</a>
              <span className="block text-[10px] text-gray-400 mt-0.5">Mon–Fri: 9:00 AM – 5:00 PM EST</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 text-xs text-gray-600">
            <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-dark block font-semibold">Distribution Hub</strong>
              <span>1200 Industrial Blvd, Suite A</span>
              <span className="block">Brooklyn, NY 11231</span>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-2 bg-white border border-light-border p-6 rounded-xl shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="font-bold text-sm text-dark">Message Sent Successfully!</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Thank you for contacting Arab Market support. A customer agent will reply shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order query, Wholesale inquiry, etc."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message details..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-cream text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Support Request</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
