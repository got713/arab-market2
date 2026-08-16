'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useLocaleStore } from '@/store/locale-store';
import { getErrorMessage } from '@/lib/utils';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { locale } = useLocaleStore();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    setError('');
    setResultMessage('');
    try {
      // The backend always returns the same generic message whether or not
      // this email has an account — that's deliberate (see
      // AuthController::forgotPassword) and this page must never try to
      // second-guess or distinguish the two cases.
      const message = await requestPasswordReset(email);
      setResultMessage(message);
    } catch (err) {
      setError(getErrorMessage(err, locale === 'ar' ? 'حدث خطأ، برجاء المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 fade-in space-y-6">
      <div className="bg-white border border-light-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-dark">{locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}</h1>
          <p className="text-xs text-gray-500">
            {locale === 'ar'
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {resultMessage ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="text-sm text-dark font-medium">{resultMessage}</p>
            <Link href="/account" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rtl:left-auto rtl:right-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className={`w-full py-2.5 text-cream font-bold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 ${
                sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {sending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{sending ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (locale === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')}</span>
            </button>

            <Link href="/account" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 pt-1">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
