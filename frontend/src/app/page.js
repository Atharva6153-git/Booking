import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-73px)] bg-white dark:bg-neutral-950">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-black dark:text-white mb-6 md:mb-8 leading-tight">
          Book Trusted <br className="hidden md:block" /> Local Services.
        </h1>
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 md:mb-12 leading-relaxed px-2">
          The most elegant way to find, book, and manage professional services in your area. Simple, transparent, and beautiful.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <Link
            href="/services"
            className="w-full sm:w-auto h-12 px-8 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold transition-transform hover:scale-105"
          >
            Explore Services
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto h-12 px-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-sm font-semibold transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
