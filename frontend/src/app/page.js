import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-73px)] bg-white">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black mb-8 leading-tight">
          Book Trusted <br className="hidden md:block" /> Local Services.
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 mb-12 leading-relaxed">
          The most elegant way to find, book, and manage professional services in your area. Simple, transparent, and beautiful.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/services"
            className="h-12 px-8 flex items-center justify-center rounded-full bg-black text-white text-sm font-medium transition-transform hover:scale-105"
          >
            Explore Services
          </Link>
          <Link
            href="/login"
            className="h-12 px-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-black text-sm font-medium transition-colors hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
