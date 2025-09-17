'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        no_handphone: '',
        password: '',
        confirmPassword: '',
        alamat: '',
        pendidikan_terakhir: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    if (isLoggedIn) {
        return null;
    }

    const validateFormAndReturnErrors = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.no_handphone) {
            newErrors.no_handphone = 'Nomor handphone wajib diisi';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password dan konfirmasi password tidak cocok';
        }

        if (!formData.alamat) {
            newErrors.alamat = 'Alamat wajib diisi';
        }
        if (!formData.pendidikan_terakhir) {
            newErrors.pendidikan_terakhir = 'Pendidikan terakhir wajib diisi';
        }

        return newErrors;
    };

    const validateForm = () => {
        const newErrors = validateFormAndReturnErrors();
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setHasSubmitted(true);

        // Always validate form first and keep existing errors
        const frontendErrors = validateFormAndReturnErrors();
        
        // Check if there are critical frontend validation errors that should prevent API call
        const criticalErrors = Object.keys(frontendErrors).filter(key => 
            key !== 'confirmPassword' // Allow API call even if confirmPassword error exists
        );
        
        // If there are critical frontend validation errors, don't proceed with API call
        if (criticalErrors.length > 0) {
            setErrors(frontendErrors);
            setIsSubmitting(false);
            return;
        }
        
        // If only confirmPassword error exists, we still proceed with API call
        // but keep the frontend error to show alongside backend errors

        try {
            console.log('Sending registration request to:', `${process.env.NEXT_PUBLIC_API_KEY}/auth/register`);
            console.log('Request data:', {
                email: formData.email,
                no_handphone: formData.no_handphone,
                password: '[HIDDEN]',
                alamat: formData.alamat,
                pendidikan_terakhir: formData.pendidikan_terakhir
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    no_handphone: formData.no_handphone,
                    password: formData.password,
                    alamat: formData.alamat,
                    pendidikan_terakhir: formData.pendidikan_terakhir
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                // Redirect to OTP verification page with email
                router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
            } else {
                // Handle validation errors from backend
                if (data.errors && Array.isArray(data.errors)) {
                    // Backend returns validation errors in array format
                    const newErrors: Record<string, string> = {};

                    data.errors.forEach((error: any) => {
                        if (error.path) {
                            // Map backend field names to frontend field names
                            const fieldMap: Record<string, string> = {
                                'email': 'email',
                                'no_handphone': 'no_handphone',
                                'password': 'password',
                                'alamat': 'alamat',
                                'pendidikan_terakhir': 'pendidikan_terakhir'
                            };

                            const frontendField = fieldMap[error.path] || error.path;
                            newErrors[frontendField] = error.msg || error.message || 'Field tidak valid';
                        }
                    });

                    // If we have specific field errors, use them
                    if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                    } else {
                        // Fallback to general error
                        setErrors({ general: data.message || 'Terdapat kesalahan validasi' });
                    }
                } else {
                    // Handle single error message or array of error messages
                    const errorMessage = data.message || `Server error: ${response.status} ${response.statusText}`;
                    
                    // Check if message is an array (new backend format)
                    if (Array.isArray(errorMessage)) {
                        const newErrors: Record<string, string> = { ...frontendErrors };
                        
                        errorMessage.forEach((msg: string) => {
                            // Check if error is about email already exists
                            if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('terdaftar')) {
                                newErrors.email = msg;
                            }
                            // Check if error is about phone already exists
                            else if (msg.toLowerCase().includes('handphone') && msg.toLowerCase().includes('terdaftar')) {
                                newErrors.no_handphone = msg;
                            }
                            // Other errors go to general
                            else {
                                newErrors.general = msg;
                            }
                        });
                        
                        setErrors(newErrors);
                    } else {
                        // Handle string error message (old format)
                        const msgString = String(errorMessage);
                        const newErrors: Record<string, string> = { ...frontendErrors };
                        
                        // Check if error is about email already exists
                        if (msgString.toLowerCase().includes('email') && msgString.toLowerCase().includes('terdaftar')) {
                            newErrors.email = msgString;
                        }
                        // Check if error is about phone already exists
                        else if (msgString.toLowerCase().includes('handphone') && msgString.toLowerCase().includes('terdaftar')) {
                            newErrors.no_handphone = msgString;
                        }
                        // Default to general error
                        else {
                            newErrors.general = msgString;
                        }
                        
                        setErrors(newErrors);
                    }
                }
                // Registration failed - don't log to console to avoid NextJS Development Overlay
                // console.error('Registration failed:', data);
            }
        } catch (error) {
            console.error('Network error during registration:', error);
            setErrors({ general: `Terjadi kesalahan jaringan: ${error instanceof Error ? error.message : 'Unknown error'}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push('/');
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
                            <h1 className="text-3xl font-bold mb-2 text-foreground">Daftar Akun Baru</h1>
                            <p className="text-sm text-muted-foreground">Bergabunglah dengan PlanHub untuk mengelola event Anda</p>
                            {errors.general && (
                                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-600">{errors.general}</p>
                                </div>
                            )}
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-foreground">Alamat Email *</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isSubmitting}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Nomor Handphone */}
                            <div className="space-y-2">
                                <label htmlFor="no_handphone" className="block text-sm font-medium text-foreground">Nomor Handphone *</label>
                                <Input
                                    id="no_handphone"
                                    type="tel"
                                    placeholder="08xxxxxxxxxx"
                                    autoComplete="tel"
                                    value={formData.no_handphone}
                                    onChange={(e) => handleInputChange('no_handphone', e.target.value)}
                                    disabled={isSubmitting}
                                    className={errors.no_handphone ? 'border-red-500' : ''}
                                />
                                {errors.no_handphone && <p className="text-sm text-red-600">{errors.no_handphone}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-foreground">Kata Sandi *</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        disabled={isSubmitting}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className="text-xs space-y-1 mt-2">
                                    <div className={`flex items-center gap-2 transition-all duration-300 ${
                                        (!formData.password && !hasSubmitted) ? 'text-gray-500' : 
                                        formData.password.length >= 8 ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {formData.password.length >= 8 ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Minimal 8 karakter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-all duration-300 ${
                                        (!formData.password && !hasSubmitted) ? 'text-gray-500' : 
                                        /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {/[a-z]/.test(formData.password) ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Mengandung huruf kecil</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-all duration-300 ${
                                        (!formData.password && !hasSubmitted) ? 'text-gray-500' : 
                                        /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {/[A-Z]/.test(formData.password) ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Mengandung huruf besar</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-all duration-300 ${
                                        (!formData.password && !hasSubmitted) ? 'text-gray-500' : 
                                        /\d/.test(formData.password) ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {/\d/.test(formData.password) ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Mengandung angka</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-all duration-300 ${
                                        (!formData.password && !hasSubmitted) ? 'text-gray-500' : 
                                        /[\W_]/.test(formData.password) ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {/[\W_]/.test(formData.password) ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Mengandung karakter spesial</span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">Konfirmasi Kata Sandi *</label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        disabled={isSubmitting}
                                        className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                            </div>

                            {/* Alamat */}
                            <div className="space-y-2">
                                <label htmlFor="alamat" className="block text-sm font-medium text-foreground">Alamat *</label>
                                <Input
                                    id="alamat"
                                    type="text"
                                    placeholder="Alamat lengkap Anda"
                                    value={formData.alamat}
                                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                                    disabled={isSubmitting}
                                    className={errors.alamat ? 'border-red-500' : ''}
                                />
                                {errors.alamat && <p className="text-sm text-red-600">{errors.alamat}</p>}
                            </div>

                            {/* Pendidikan Terakhir */}
                            <div className="space-y-2">
                                <label htmlFor="pendidikan_terakhir" className="block text-sm font-medium text-foreground">Pendidikan Terakhir *</label>
                                <select
                                    id="pendidikan_terakhir"
                                    value={formData.pendidikan_terakhir}
                                    onChange={(e) => handleInputChange('pendidikan_terakhir', e.target.value)}
                                    disabled={isSubmitting}
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.pendidikan_terakhir ? 'border-red-500' : 'border-border'
                                        }`}
                                >
                                    <option value="">Pilih pendidikan terakhir</option>
                                    <option value="SD/MI">SD/MI</option>
                                    <option value="SMP/MTS">SMP/MTS</option>
                                    <option value="SMA/SMK">SMA/SMK</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Sarjana">Sarjana</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                                {errors.pendidikan_terakhir && <p className="text-sm text-red-600">{errors.pendidikan_terakhir}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                            </Button>
                        </form>

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
