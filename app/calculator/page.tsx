// app/calculator/page.tsx
import AssetCalculator from '@/app/components/AssetCalculator';
import Link from 'next/link';

export default function CalculatorPage() {
  return (
    // --- ADDED: Same dark background and flex layout as the home page ---
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl">
        {/* NAVIGATION BAR FOR CALCULATOR PAGE */}
        <nav className="flex justify-center space-x-4 mb-6">
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-md hover:bg-gray-600 hover:text-white transition-colors"
          >
            &larr; Back to Oracle
          </Link>
          <a 
            href="/calculator" 
            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md cursor-default"
          >
            Calculator
          </a>
        </nav>

        <AssetCalculator />
      </main>
    </div>
  );
}