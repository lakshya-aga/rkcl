'use client';

import { useRouter } from 'next/navigation';
import ItemList from '@/components/ItemList';

export default function ItemsPage() {
  const router = useRouter();

  const handleAddNewItem = () => {
    router.push('/items/new');
  };

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Items</h1>
        <button
          onClick={handleAddNewItem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add New Item
        </button>
      </div>
      <ItemList />
    </main>
  );
}
