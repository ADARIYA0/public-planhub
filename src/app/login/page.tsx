'use client';

import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Logika login dapat ditambahkan di sini
    console.log('Form submitted');
  };
  
  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative px-4 py-6">
      {/* Header disembunyikan sesuai permintaan */}
      {/* Tombol Kembali dengan responsivitas yang lebih baik */}
      <div className="w-full max-w-md flex justify-start mb-4">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center text-foreground hover:bg-muted/50"
          size="sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali
        </Button>
      </div>
      <div className="w-full max-w-md px-4 sm:px-6 py-6 sm:py-8 bg-background rounded-lg shadow-sm border border-border/10">
        {/* Form login */}
        <div className="w-full flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">

            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-foreground">Selamat datang kembali</h1>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">Alamat email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@email.com" 
                  autoComplete="email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">Kata sandi</label>
                  <Link href="#" className="text-sm text-primary hover:underline hover:text-primary/90 transition-colors">
                    Lupa kata sandi?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 focus:ring-offset-background"
                />
                <label htmlFor="remember" className="text-sm text-foreground">Ingatkan saya</label>
              </div>
              
              <Button type="submit" className="w-full font-medium">
                Masuk
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Atau lanjutkan dengan</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full hover:bg-muted/50 transition-colors"
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Masuk dengan Google
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-foreground">
              Belum punya akun?{" "}
              <Link href="#" className="text-primary hover:underline hover:text-primary/90 transition-colors font-medium">
                Daftar
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
