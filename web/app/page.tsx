import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-black mb-4">Print Duka</h1>
        <p className="text-gray-600 mb-8">We Build Brands Through Print</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
