'use client';

import { useRouter } from 'next/navigation';
import PurchaseList from '@/components/PurchaseList';

export default function PurchasesPage() {
  const router = useRouter();

  const handleAddNewPurchase = () => {
    router.push('/purchase/new');
  };

  return (
    <main className="p-4">
      <div className="flex justify-between Purchases-center mb-4">
        <h1 className="text-2xl font-bold">All Purchases</h1>
        <button
          onClick={handleAddNewPurchase}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add New Purchase
        </button>
      </div>
      <PurchaseList />
    </main>
  );
}
