'use client';

import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { saveDropdownValue, saveItem, fetchDropdownValues } from '../utils/firebaseUtils';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Assuming you have a firebase.js file with db export

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

const ItemForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track if dropdowns have been loaded
  const [isLoaded, setIsLoaded] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    categories: [],
    subCategories: [],
    brands: [],
    stores: [],
    sizes: [],
    qualities: [],
    colors: [],
  });
  
  const loadDropdownData = async () => {
    // Don't fetch again if already loaded
    if (isLoaded && !loading) return;
    
    try {
      setLoading(true);
      
      // Fetch all dropdown values in parallel
      const [
        categories,
        subCategories,
        brands,
        stores,
        sizes,
        qualities,
        colors,
      ] = await Promise.all([
        fetchDropdownValues('categories'),
        fetchDropdownValues('subCategories'),
        fetchDropdownValues('brands'),
        fetchDropdownValues('stores'),
        fetchDropdownValues('sizes'),
        fetchDropdownValues('qualities'),
        fetchDropdownValues('colors'),
      ]);
      
      // Update state with fetched values
      setDropdowns({
        categories: categories || [],
        subCategories: subCategories || [],
        brands: brands || [],
        stores: stores || [],
        sizes: sizes || [],
        qualities: qualities || [],
        colors: colors || [],
      });
      
      setIsLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dropdown values:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Auto-load dropdown values on component mount
  useEffect(() => {
    loadDropdownData();
  }, []);

  const [formData, setFormData] = useState({
    code: '',
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

  // Helper to get the prefix based on category/subCategory`
  const getSerialPrefix = (category, subCategory) => {
    if (
      category?.toLowerCase() === 'cloth' &&
      subCategory?.toLowerCase() === 'cloth roll'
    ) {
      return 'H';
    }
    return 'I';
  };

  // Helper to fetch the next serial number and color code
  const getNextSerialCode = async (category, subCategory, color) => {
    // Only if category is 'cloth' and subCategory is 'roll', prefix is 'H', else 'I'
    const isClothRoll =
      category?.toLowerCase() === 'cloth' &&
      subCategory?.toLowerCase() === 'roll';
    const prefix = isClothRoll ? 'H' : 'I';

    // Query all items with same prefix
    const itemsRef = collection(db, 'items');
    const snapshot = await getDocs(itemsRef);

    let serialMap = {}; // { serial: [{brand, quality, size, colorCode}] }
    let serialNumbers = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const code = data.code || '';
      // Parse code: e.g. H000001A or I000001A
      const match = code.match(/^([HI])(\d{6})([A-Z])$/);
      if (match && match[1] === prefix) {
        const serial = match[2];
        const colorCode = match[3];
        const brand = (data.brand || '').toLowerCase();
        const quality = (data.quality || '').toLowerCase();
        const size = (data.size || '').toLowerCase();

        if (!serialMap[serial]) serialMap[serial] = [];
        serialMap[serial].push({ brand, quality, size, colorCode });
        serialNumbers.push(parseInt(serial, 10));
      }
    });

    // Find the highest serial number for this prefix
    let nextSerial = 1;
    if (serialNumbers.length > 0) {
      nextSerial = Math.max(...serialNumbers);
    }

    // Check if a serial exists with same brand, quality, size
    const formBrand = (formData.brand || '').toLowerCase();
    const formQuality = (formData.quality || '').toLowerCase();
    const formSize = (formData.size || '').toLowerCase();

    let foundSerial = null;
    let maxColorChar = 'A';

    // Search for existing serial with same brand, quality, size
    for (let serial of Object.keys(serialMap)) {
      for (let entry of serialMap[serial]) {
        if (
          entry.brand === formBrand &&
          entry.quality === formQuality &&
          entry.size === formSize
        ) {
          foundSerial = serial;
          // Find max color code for this serial
          if (entry.colorCode > maxColorChar) {
            maxColorChar = entry.colorCode;
          }
        }
      }
    }

    let serialToUse, colorChar;
    if (foundSerial) {
      serialToUse = foundSerial;
      // Increment color character
      colorChar = String.fromCharCode(maxColorChar.charCodeAt(0) + 1);
    } else {
      serialToUse = String(nextSerial + 1).padStart(6, '0');
      colorChar = 'A';
    }

    return `${prefix}${serialToUse}${colorChar}`;
  };
  const updateCode = async () => {
  if (formData.category && formData.subCategory && formData.color) {
    const code = await getNextSerialCode(
      formData.category,
      formData.subCategory,
      formData.color
    );
    console.log('Generated code:', code);
    return code;
  }
  return '';
};
  // Update code when category, subCategory, or color changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    console.log("Generating Code...");
    const code = await updateCode(); // Get the new code first

    const finalData = {
      ...formData,
      code,
      createdAt: Timestamp.now(),
    };

    console.log('Final Form Data:', finalData);

    // Save dropdown values
    await Promise.all([
      finalData.category && saveDropdownValue('categories', finalData.category),
      finalData.subCategory && saveDropdownValue('subCategories', finalData.subCategory),
      finalData.brand && saveDropdownValue('brands', finalData.brand),
      finalData.store && saveDropdownValue('stores', finalData.store),
      finalData.size && saveDropdownValue('sizes', finalData.size),
      finalData.quality && saveDropdownValue('qualities', finalData.quality),
      finalData.color && saveDropdownValue('colors', finalData.color),
    ]);

    // Save item
    await saveItem(finalData);
    console.log('Item saved with ID:', finalData.code);
    alert('Item saved!');

    setFormData((prev) => ({ ...prev, code: finalData.code })); // Optional: update form after save
  } catch (err) {
    console.error('Error saving item:', err);
    setError(err.message);
    alert('Error saving item: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg mt-8 text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Create New Item</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button 
        type="button"
        onClick={loadDropdownData}
        disabled={loading}
        className="px-4 py-2 mb-6 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {loading ? 'Loading...' : isLoaded ? 'Reload Data' : 'Load Dropdown Data'}
      </button>
      
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Code (Auto)</label>
            <input
              type="text"
              value={formData.code}
              disabled
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-lg font-extrabold mt-8 mb-4">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {DROPDOWN_KEYS.map((key) => {
            // Convert key to match dropdowns object structure (plural form)
            const dropdownKey = key === 'category' ? 'categories' : 
                              key === 'subCategory' ? 'subCategories' : 
                              key === 'brand' ? 'brands' : 
                              key === 'store' ? 'stores' : 
                              key === 'size' ? 'sizes' : 
                              key === 'quality' ? 'qualities' : 
                              'colors';
            
            return (
              <CreatableDropdown
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                name={key}
                value={formData[key] || ''}
                options={dropdowns[dropdownKey] || []}
                onChange={handleDropdownChange}
              />
            );
          })}

          <div>
            <label className="block text-sm font-extrabold mt-8 mb-4">Item Type</label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="raw">Raw</option>
              <option value="finish">Finish</option>
            </select>
          </div>
        </div>

        {/* Pricing Info */}
        <h2 className="text-lg font-extrabold mt-8 mb-4">Pricing & Tax</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">MRP</label>
            <input
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price</label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HSN Code</label>
            <input
              type="text"
              name="hsn"
              value={formData.hsn}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax (%)</label>
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </form>
    </div>
  );
};

export default ItemForm;