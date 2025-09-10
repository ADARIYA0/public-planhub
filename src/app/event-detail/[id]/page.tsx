'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Share2, 
  Heart,
  ArrowLeft,
  Check,
  AlertCircle,
  Ticket,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { mockEvents } from '@/data/mockEvents';
import { Event, User } from '@/types';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationToken, setRegistrationToken] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  // Menentukan halaman asal berdasarkan search params
  const fromPage = searchParams.get('from') || 'home';
  const currentView = fromPage === 'event' ? 'search' : 'home';

  // Find event by ID
  const event = mockEvents.find(e => e.id === params.id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentView} isLoggedIn={!!user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Tidak Ditemukan</h1>
            <Button onClick={() => router.push(fromPage === 'event' ? '/event' : '/')}>
              Kembali ke {fromPage === 'event' ? 'Daftar Event' : 'Beranda'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Konferensi': 'bg-teal-50 text-teal-700 border-teal-200',
      'Workshop': 'bg-blue-50 text-blue-700 border-blue-200',
      'Seminar': 'bg-slate-50 text-slate-700 border-slate-200',
      'Meetup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Festival': 'bg-rose-50 text-rose-700 border-rose-200',
      'Concert': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const isEventFull = event.registeredParticipants >= event.maxParticipants;
  const isEventPassed = new Date(`${event.date} ${event.time}`) < new Date();
  const availableSlots = event.maxParticipants - event.registeredParticipants;

  const handleRegister = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsRegistering(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Berhasil mendaftar event "${event.title}"! Token kehadiran akan dikirim ke email Anda.`);
      setIsRegistering(false);
    }, 1000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} isLoggedIn={!!user} />
      
      {/* Header */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFavorited(!isFavorited)}
                className={isFavorited ? 'text-red-600 border-red-200' : ''}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Tersimpan' : 'Simpan'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1.5" />
                Bagikan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={event.image}
                alt={event.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              <div className="absolute top-4 left-4">
                <Badge className={`${getCategoryColor(event.category)} border font-medium`}>
                  {event.category}
                </Badge>
              </div>
              {!event.isRegistrationOpen && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-500 text-white border-red-500">Pendaftaran Ditutup</Badge>
                </div>
              )}
            </div>

            {/* Event Info */}
            <Card className="border-0 shadow-medium">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.9 dari 250 ulasan)</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{formatPrice(event.price)}</span>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{formatDate(event.date)}</div>
                      <div className="text-sm">{event.time} WIB</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Lokasi Event</div>
                      <div className="text-sm">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{event.registeredParticipants} / {event.maxParticipants}</div>
                      <div className="text-sm">Peserta terdaftar</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">6 Jam</div>
                      <div className="text-sm">Durasi event</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Deskripsi Event</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Event ini merupakan kesempatan emas untuk mempelajari teknologi terdepan dari para ahli di bidangnya. 
                    Peserta akan mendapatkan sertifikat resmi dan kesempatan networking dengan profesional lainnya. 
                    Dilengkapi dengan hands-on workshop dan studi kasus real dari industri.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Yang Akan Anda Dapatkan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Sertifikat resmi kehadiran',
                      'Materi presentasi lengkap',
                      'Networking session eksklusif',
                      'Konsumsi dan coffee break',
                      'Akses ke komunitas alumni',
                      'Follow-up session online'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="border-0 shadow-large">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Daftar Event</span>
                  {availableSlots <= 10 && availableSlots > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {availableSlots} slot tersisa
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(event.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.price === 0 ? 'Event gratis terbatas' : 'Termasuk semua fasilitas'}
                    </div>
                  </div>
                </div>

                {!user ? (
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-primary hover:bg-teal-700 text-white font-semibold py-3"
                      onClick={() => router.push('/login')}
                    >
                      Masuk untuk Mendaftar
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Daftar akun gratis untuk mengikuti event ini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {event.isRegistrationOpen && !isEventFull && !isEventPassed ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-primary hover:bg-teal-700 text-white font-semibold py-3">
                            <Ticket className="h-4 w-4 mr-2" />
                            Daftar Sekarang
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-teal-50 rounded-lg">
                              <h4 className="font-medium text-teal-900 mb-1">{event.title}</h4>
                              <p className="text-sm text-teal-700">{formatDate(event.date)} • {event.time} WIB</p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="token">Token Pendaftaran (Opsional)</Label>
                              <Input
                                id="token"
                                placeholder="Masukkan token jika ada"
                                value={registrationToken}
                                onChange={(e) => setRegistrationToken(e.target.value)}
                              />
                              <p className="text-xs text-gray-500">
                                Token khusus dari sponsor atau partner
                              </p>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Perhatian:</p>
                                <p>Pendaftaran tidak dapat dibatalkan. Pastikan Anda dapat menghadiri event ini.</p>
                              </div>
                            </div>

                            <Button
                              onClick={handleRegister}
                              disabled={isRegistering}
                              className="w-full bg-primary hover:bg-teal-700"
                            >
                              {isRegistering ? 'Mendaftar...' : 'Konfirmasi Pendaftaran'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button disabled className="w-full" variant="secondary">
                        {isEventPassed ? 'Event Sudah Berlalu' : isEventFull ? 'Event Penuh' : 'Pendaftaran Ditutup'}
                      </Button>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kapasitas</span>
                    <span className="font-medium">{event.maxParticipants} peserta</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Terdaftar</span>
                    <span className="font-medium text-emerald-600">{event.registeredParticipants} peserta</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sisa slot</span>
                    <span className="font-medium text-rose-600">{availableSlots} slot</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Penyelenggara</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">PH</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">PlanHub Official</h4>
                    <p className="text-sm text-gray-600">Organizer terpercaya</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2 text-primary" />
                    <span>www.planhub.id</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <span>hello@planhub.id</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <span>+62 21 1234 5678</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Lihat Profile Organizer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
