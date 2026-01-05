import { Compass } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center gap-2">
            <Compass className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              CareerCompass
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
