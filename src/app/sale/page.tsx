'use client';

import { useRouter } from 'next/navigation';
import SaleList from '@/components/SaleList';

export default function SalesPage() {
  const router = useRouter();

  const handleAddNewSale = () => {
    router.push('/sale/new');
  };

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Items</h1>
        <button
          onClick={handleAddNewSale}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add New Item
        </button>
      </div>
      <ItemList />
    </main>
  );
}
