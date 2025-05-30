'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { fetchDropdownValues } from '@/utils/firebaseUtils';
import CreatableSelect from 'react-select/creatable';

const DROPDOWN_KEYS = [
  'category',
  'subCategory',
  'brand',
  'store',
  'size',
  'quality',
  'color',
];

const CreatableDropdown = ({ label, name, value, onChange, options }) => {
    const formattedOptions = options?.map((opt) => ({ label: opt, value: opt })) || [];
  
    const handleChange = (selectedOption) => {
      onChange(name, selectedOption?.value || '');
    };
  
    return (
      <div className="form-group mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <CreatableSelect
          isClearable
          options={formattedOptions}
          onChange={handleChange}
          value={value ? { label: value, value } : null}
          placeholder={`Select or create ${label.toLowerCase()}`}
        />
      </div>
    );
  };
export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    store: '',
    category: '',
    subCategory: '',
    brand: '',
    size: '',
    quality: '',
    color: '',
    itemType: '',
    mrp: '',
    sellingPrice: '',
    cost: '',
    hsn: '',
    tax: '',
    taxBrackets: [],
  });

    const [dropdowns, setDropdowns] = useState({
    category: [],
    subcategory: [],
    brand: [],
    store: [],
    size: [],
    quality: [],
    color: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFormData({ ...docSnap.data(), id });
      } else {
        alert('Item not found');
        router.push('/items');
      }

      const fetchedDropdowns = {};
      for (const key of DROPDOWN_KEYS) {
        fetchedDropdowns[key] = await fetchDropdownValues(key);
      }
      setDropdowns(fetchedDropdowns);
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, ...data } = formData;
      data.updatedAt = Timestamp.now();
      await updateDoc(doc(db, 'items', id), data);
      alert('Item updated!');
      router.push('/items');
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update item.');
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-6 ">
      <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow text-gray-900">
        <div className="grid grid-cols-2 gap-4 ">
          <div>
            <label>Name</label>
            <input
              className="w-full border px-2 py-1"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>MRP</label>
            <input
              className="w-full border px-2 py-1"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Selling Price</label>
            <input
              className="w-full border px-2 py-1"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Cost</label>
            <input
              className="w-full border px-2 py-1"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
            />
          </div>
        </div>

        {DROPDOWN_KEYS.map((key) => (
          <CreatableDropdown
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            name={key} // e.g. "category" => "category"
            value={formData[key]}
            onChange={handleDropdownChange}
            options={dropdowns[key]}
          />
        ))}

        <button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Update Item
        </button>
      </form>
    </div>
  );
}
