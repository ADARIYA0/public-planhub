import { Header } from '@/components/Header';

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Header 
        currentView="login"
        isLoggedIn={false}
      />
    </div>
  );
}
