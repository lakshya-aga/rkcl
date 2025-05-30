'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllItems, deleteItem} from '../utils/firebaseUtils';

const ItemList = () => {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      const data = await fetchAllItems();
      setItems(data);
    };

    loadItems();
  }, []);
  const handleDelete = async (id) => {
    const confirmed = confirm('Are you sure you want to delete this item?');
    if (!confirmed) return;

    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (id) => {
    router.push(`/items/${id}`);
  };



  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Inventory Items</h1>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b text-gray-900">Action</th>
                <th className="py-2 px-4 border-b text-gray-900">Code</th>
                <th className="py-2 px-4 border-b text-gray-900">Name</th>
                <th className="py-2 px-4 border-b text-gray-900">Category</th>
                <th className="py-2 px-4 border-b text-gray-900">Brand</th>
                <th className="py-2 px-4 border-b text-gray-900">MRP</th>
                <th className="py-2 px-4 border-b text-gray-900">Store</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-900">
                    <button
                    onClick={() => handleEdit(item.id)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                    Edit
                    </button>
                    <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                    Delete
                    </button>
                </td>
                  <td className="py-2 px-4 border-b text-gray-900">{item.code}</td>
                  <td className="py-2 px-4 border-b text-gray-900">{item.name}</td>
                  <td className="py-2 px-4 border-b text-gray-900">{item.category}</td>
                  <td className="py-2 px-4 border-b text-gray-900">{item.brand}</td>
                  <td className="py-2 px-4 border-b text-gray-900">{item.mrp}</td>
                  <td className="py-2 px-4 border-b text-gray-900">{item.store}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ItemList;
