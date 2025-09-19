'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventCard } from '@/components/EventCard';
import { Footer } from '@/components/Footer';
import { Calendar, Users, ArrowRight, ChevronRight, Star, Shield, Zap, TrendingUp } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Event, User } from '@/types';

export default function Home() {
  const { user, isLoggedIn } = useAuth();
  const { events, loading, error } = useEvents({ limit: 6, upcoming: true });
  const router = useRouter();

  const handleViewEvent = (eventSlug: string) => {
    router.push(`/event/${eventSlug}`);
  };

  const handleRegisterEvent = (eventId: number) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    console.log('Register for event:', eventId);
  };

  const handleViewChange = (view: string) => {
    if (view === 'search') {
      router.push('/event');
    } else if (view === 'login') {
      router.push('/login');
    } else if (view === 'register') {
      router.push('/login'); // For now, redirect register to login
    }
  };

  return (
    <div className="page-enter">
      <Header 
        currentView="home"
        onViewChange={handleViewChange}
      />

      {/* Hero Section with Background Image */}
      <section>
        <div className="max-w-screen mx-auto px-4">
          <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl">
            {/* Background Image */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Image
                src="/hero-background.jpg"
                alt="Conference audience background"
                fill
                className="object-cover object-center"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/75 rounded-2xl"></div>
            
            {/* Content */}
            <div className="relative container mx-auto px-6 text-center text-white z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <Star className="h-5 w-5 text-yellow-400 mr-3" />
                  <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 font-semibold px-4 py-1.5 text-sm">
                    Platform Event Terpercaya #1 Indonesia
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  Temukan Event yang
                  <span className="block text-teal-400 mt-2">
                    Mengubah Hidup Anda
                  </span>
                </h1>
                
                <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Bergabunglah dengan ribuan peserta dalam event berkualitas tinggi. 
                  Dari workshop tech hingga festival musik, semua ada di sini.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => handleViewChange('search')}
                    className="bg-primary hover:bg-teal-700 text-white px-8 py-4 font-semibold text-base shadow-xl-colored"
                  >
                    Jelajahi Event Sekarang
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleViewChange(user ? 'dashboard' : 'register')}
                    className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-4 font-semibold text-base bg-white/10 backdrop-blur-sm"
                  >
                    {user ? 'Dashboard Saya' : 'Mulai Gratis'}
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-300">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-emerald-400" />
                    Keamanan Terjamin
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-teal-400" />
                    50K+ Peserta Aktif
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-400" />
                    Rating 4.9/5
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-teal-500/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-500/20 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-rose-400/20 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Event Tersedia</div>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Peserta Aktif</div>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">25+</div>
              <div className="text-gray-600 font-medium">Kota di Indonesia</div>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Kepuasan Peserta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-4 font-semibold">
              Event Populer
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Event Terbaik Bulan Ini</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Jangan lewatkan event populer yang paling diminati peserta kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-500 mb-4">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Gagal memuat event</p>
                  <p className="text-sm text-gray-500 mt-2">{error}</p>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold text-gray-600">Belum ada event tersedia</p>
                <p className="text-sm text-gray-500 mt-2">Event akan segera hadir, pantau terus ya!</p>
              </div>
            ) : (
              events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewEvent}
                  onRegister={handleRegisterEvent}
                  isLoggedIn={isLoggedIn}
                  fromPage="home"
                />
              ))
            )}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => handleViewChange('search')}
              className="bg-slate-700 hover:bg-slate-800 text-white font-semibold px-8 py-3"
            >
              Lihat Semua Event
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 mb-4 font-semibold">
              Dipercaya Oleh
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ribuan Peserta Setia</h2>
            <p className="text-gray-600 text-lg">Bergabunglah dengan komunitas yang terus berkembang</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-medium hover:shadow-large transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Keamanan Terjamin</h4>
              <p className="text-gray-600">Data dan transaksi aman dengan enkripsi tingkat enterprise</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-medium hover:shadow-large transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Proses Cepat</h4>
              <p className="text-gray-600">Pendaftaran instant dan konfirmasi otomatis dalam hitungan detik</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-medium hover:shadow-large transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Rating Tinggi</h4>
              <p className="text-gray-600">4.9/5 rating dari ribuan peserta yang puas dengan layanan kami</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}