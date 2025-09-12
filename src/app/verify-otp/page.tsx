'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Get email from URL params
    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }
    }, [searchParams]);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    // Countdown timer for resend button
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    if (isLoggedIn) {
        return null;
    }

    const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!email || !otp) {
            setError('Email dan OTP diperlukan');
            setIsSubmitting(false);
            return;
        }

        if (otp.length !== 6) {
            setError('OTP harus 6 digit');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Verifikasi berhasil! Akun Anda sudah aktif.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message || 'Verifikasi OTP gagal. Silakan coba lagi.');
            }
        } catch (error) {
            setError('Terjadi kesalahan yang tidak terduga.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            setError('Email diperlukan untuk mengirim ulang OTP');
            return;
        }

        setError('');
        setSuccess('');
        setIsResending(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('OTP baru telah dikirim ke email Anda.');
                setCountdown(60); // 60 seconds countdown
                setOtp(''); // Clear current OTP
            } else {
                setError(data.message || 'Gagal mengirim ulang OTP. Silakan coba lagi.');
            }
        } catch (error) {
            setError('Terjadi kesalahan yang tidak terduga.');
        } finally {
            setIsResending(false);
        }
    };

    const handleBack = () => {
        router.push('/register');
    };

    const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background relative px-4 py-6 page-enter">
            {/* Tombol Kembali */}
            <div className="w-full max-w-md flex justify-start mb-4">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="flex items-center text-foreground hover:bg-muted/50"
                    size="sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Kembali
                </Button>
            </div>

            <div className="w-full max-w-md px-4 sm:px-6 py-6 sm:py-8 bg-background rounded-lg shadow-sm border border-border/10">
                <div className="w-full flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-foreground">Verifikasi Email</h1>
                            <p className="text-sm text-muted-foreground">
                                Kami telah mengirimkan kode OTP 6 digit ke email <strong>{email}</strong>.
                                Silakan masukkan kode tersebut untuk mengaktifkan akun Anda.
                            </p>

                            {error && (
                                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                                    <p className="text-sm text-green-600">{success}</p>
                                </div>
                            )}
                        </div>

                        <form className="space-y-6" onSubmit={handleVerifyOTP}>
                            {/* Email (readonly) */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-muted/50"
                                />
                            </div>

                            {/* OTP Input */}
                            <div className="space-y-2">
                                <label htmlFor="otp" className="block text-sm font-medium text-foreground">Kode OTP</label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={handleOTPChange}
                                    disabled={isSubmitting}
                                    maxLength={6}
                                    className="text-center text-2xl font-mono tracking-widest"
                                    autoComplete="one-time-code"
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Masukkan 6 digit kode yang dikirim ke email Anda
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-medium"
                                disabled={isSubmitting || !otp || otp.length !== 6}
                            >
                                {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                            </Button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                Tidak menerima kode?
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResendOTP}
                                disabled={isResending || countdown > 0}
                                className="text-primary hover:text-primary/90"
                            >
                                {isResending
                                    ? 'Mengirim...'
                                    : countdown > 0
                                        ? `Kirim ulang dalam ${countdown}s`
                                        : 'Kirim ulang OTP'
                                }
                            </Button>
                        </div>

                        <div className="mt-8 text-center text-sm text-foreground">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary hover:underline hover:text-primary/90 transition-colors font-medium">
                                Masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center text-xs text-muted-foreground px-4">
                © 2025 PT PlanHub Kreatif Nusantara. All Rights Reserved
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
