'use client';

import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
  onRegister: (eventId: string) => void;
  isLoggedIn: boolean;
  fromPage?: 'home' | 'event';
}

export function EventCard({ event, onViewDetails, onRegister, isLoggedIn, fromPage = 'home' }: EventCardProps) {
  const router = useRouter();
  
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

  const handleViewDetails = () => {
    router.push(`/event-detail/${event.id}?from=${fromPage}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-200 shadow-medium hover:-translate-y-1 flex flex-col h-full">
      <div className="relative overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          width={400}
          height={192}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(event.category)} border font-semibold text-xs backdrop-blur-sm`}>
            {event.category}
          </Badge>
        </div>
        {!event.isRegistrationOpen && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-500 text-white border-red-500 text-xs font-semibold">Ditutup</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors text-gray-900 leading-tight text-lg">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        
        <div className="space-y-3 mb-5">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
            <span className="text-gray-700 font-medium">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
            <span className="text-gray-700 font-medium">{event.time} WIB</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
            <span className="text-gray-700 line-clamp-1 font-medium">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
            <span className="text-gray-700 font-medium">{event.registeredParticipants} / {event.maxParticipants} peserta</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 mt-auto">
          <span className="font-bold text-primary text-lg">
            {formatPrice(event.price)}
          </span>
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full font-medium">
            {event.maxParticipants - event.registeredParticipants} slot tersisa
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 bg-gray-50/50">
        <div className="w-full grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleViewDetails}
            className="h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-colors font-semibold"
          >
            Detail
          </Button>
          {isLoggedIn ? (
            <Button
              onClick={() => onRegister(event.id)}
              disabled={isEventFull || isEventPassed || !event.isRegistrationOpen}
              className="h-11 bg-primary hover:bg-teal-700 text-white disabled:bg-gray-300 disabled:text-gray-500 transition-colors font-semibold"
            >
              {isEventPassed ? 'Sudah Lewat' : isEventFull ? 'Penuh' : 'Daftar'}
            </Button>
          ) : (
            <Button
              onClick={() => onViewDetails(event.id)}
              className="h-11 bg-primary hover:bg-teal-700 text-white transition-colors font-semibold"
            >
              Login Dulu
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
