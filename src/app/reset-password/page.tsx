'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useLocaleStore } from '@/store/locale-store';
import { getErrorMessage } from '@/lib/utils';
import { Lock, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
  const { locale } = useLocaleStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const token = searchParams?.get('token') || '';
  const email = searchParams?.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // No token/email in the URL at all — this isn't a real reset link, don't
  // even show a form for it.
  if (!token || !email) {
    return (
      <div className="text-center py-6 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-dark">{locale === 'ar' ? 'رابط غير صالح' : 'Invalid Reset Link'}</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {locale === 'ar'
              ? 'هذا الرابط غير مكتمل أو غير صالح. برجاء طلب رابط جديد لإعادة تعيين كلمة المرور.'
              : "This link is incomplete or invalid. Please request a new password reset link."}
          </p>
        </div>
        <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
          {locale === 'ar' ? 'طلب رابط جديد' : 'Request a new link'}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' : 'Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError(locale === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, email, password, passwordConfirm);
      setSuccess(true);
      setTimeout(() => router.push('/account'), 2500);
    } catch (err) {
      // The backend returns the same generic message for an invalid, expired,
      // or already-used token — surfaced here as-is.
      setError(getErrorMessage(err, locale === 'ar' ? 'تعذر إعادة تعيين كلمة المرور.' : 'Could not reset your password.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-dark">{locale === 'ar' ? 'تم تحديث كلمة المرور!' : 'Password Updated!'}</h2>
          <p className="text-xs text-gray-500">
            {locale === 'ar' ? 'جارٍ تحويلك لصفحة تسجيل الدخول...' : 'Redirecting you to sign in...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-dark">{locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password'}</h1>
        <p className="text-xs text-gray-500">
          {locale === 'ar' ? `لحساب: ${email}` : `For account: ${email}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rtl:left-auto rtl:right-3" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm New Password'}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rtl:left-auto rtl:right-3" />
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
        </div>
        <p className="text-[10px] text-gray-400">
          {locale === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : 'Password must be at least 8 characters.'}
        </p>

        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2.5 text-cream font-bold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 ${
            submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          <span>{submitting ? (locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Save New Password')}</span>
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 fade-in space-y-6">
      <div className="bg-white border border-light-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <Suspense fallback={
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
