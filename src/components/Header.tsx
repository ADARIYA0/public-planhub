"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Calendar, User, LogOut, Search } from 'lucide-react';

interface HeaderProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  userName?: string;
  transparent?: boolean;
}

export function Header({ 
  currentView = 'home', 
  onViewChange = () => {}, 
  isLoggedIn = false, 
  onLogout = () => {}, 
  userName, 
  transparent = false 
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: 'Beranda', value: 'home', icon: Calendar, route: '/' },
    { label: 'Cari Event', value: 'search', icon: Search, route: '/event' },
  ];

  const userMenuItems = isLoggedIn ? [
    { label: 'Dashboard', value: 'dashboard', icon: User },
    { label: 'Riwayat Event', value: 'history', icon: Calendar },
    { label: 'Sertifikat', value: 'certificates', icon: Calendar },
  ] : [
    { label: 'Masuk', value: 'login', icon: User, route: '/login' },
    { label: 'Daftar', value: 'register', icon: User },
  ];

  const handleMenuClick = (value: string, route?: string) => {
    if (value === 'logout') {
      onLogout();
    } else if (route) {
      router.push(route);
    } else {
      onViewChange(value);
    }
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 w-full py-4">
      <div className="max-w-4xl mx-auto px-4">
        <header className="bg-slate-800 rounded-2xl shadow-lg">
          <div className="px-6 py-4">
            <div className="flex h-12 items-center justify-between">
              {/* Logo */}
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => router.push('/')}
              >
                <div className="w-8 h-8 bg-coral rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">
                  PlanHub
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {menuItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleMenuClick(item.value, item.route)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                      currentView === item.value
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Masuk button with same styling as menu items */}
                {!isLoggedIn && (
                  <button
                    onClick={handleLoginClick}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                      currentView === 'login'
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    Masuk
                  </button>
                )}
              </nav>

              {/* Desktop User Menu - when logged in */}
              {isLoggedIn && (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="font-medium text-slate-300 text-sm">
                    Halo, <span className="font-semibold text-white">{userName}</span>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => onViewChange('dashboard')}
                    className="font-medium px-3 py-1.5 text-sm text-white hover:text-primary hover:bg-slate-700"
                  >
                    <User className="h-3 w-3 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="text-coral hover:text-red-400 font-medium px-3 py-1.5 text-sm hover:bg-slate-700"
                  >
                    <LogOut className="h-3 w-3 mr-2" />
                    Keluar
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-slate-700">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {isLoggedIn && (
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-gray-600">Halo,</p>
                        <p className="font-bold text-gray-900 text-lg">{userName}</p>
                      </div>
                    )}
                    
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleMenuClick(item.value, item.route)}
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-teal-50 text-left transition-colors"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-900">{item.label}</span>
                        </button>
                      );
                    })}
                    
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleMenuClick(item.value, (item as any).route)}
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-teal-50 text-left transition-colors"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-900">{item.label}</span>
                        </button>
                      );
                    })}
                    
                    {isLoggedIn && (
                      <button
                        onClick={() => handleMenuClick('logout')}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 text-red-600 text-left transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-semibold">Keluar</span>
                      </button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
