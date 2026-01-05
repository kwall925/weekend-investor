// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">OwnShares</h1>
          <p className="mt-4 text-lg text-gray-600">
            Be your own broker, Build your own wealth
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/signup"
            className="block w-full rounded-lg bg-black py-4 text-center text-lg font-medium text-white hover:bg-gray-800"
          >
            Create Free Account
          </Link>
          
          <Link
            href="/login"
            className="block text-center text-blue-600 hover:underline"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
}