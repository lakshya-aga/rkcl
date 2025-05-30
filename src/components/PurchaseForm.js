'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CreatableSelect from 'react-select/creatable';
import { saveDropdownValue, savePurchase, fetchDropdownValues } from '../utils/firebaseUtils';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Updated dropdown keys based on the screenshot
const DROPDOWN_KEYS = [
  'supplier',
  'paymentTerms',
  'inclusiveTax',
  'surface',
  'gstType',
  'billingAddress',
  'shippingAddress',
  'gstClaim',
  'priceType',
];
const uneditablesItemDetails = ['finalAmount', 'gstAmount', 'beforeTax', 'gst', 'discount', 'freight', 'salePrice', 'margin'];
const defaultItem = {
  poNumber: "",
  sku: "",
  name: "",
  batch: "",
  qty: 0,
  mou: "STD",
  purchasePrice: 0,
  mrp: 0,
  margin: 0,
  salePrice: 0,
  discount: 0,
  freight: 0,
  beforeTax: 0,
  gst: 0,
  gstAmount: 0,
  finalAmount: 0,
};

const CreatableDropdown = ({ label, name, value, onChange, options, isRequired }) => {
  const formattedOptions = options?.map((opt) => ({ label: opt, value: opt })) || [];

  const handleChange = (selectedOption) => {
    onChange(name, selectedOption?.value || '');
  };

  return (
    <div className="form-group">
      <label className={`block text-sm font-medium mb-1 ${isRequired ? 'flex items-center' : ''}`}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <CreatableSelect
        isClearable
        options={formattedOptions}
        onChange={handleChange}
        value={value ? { label: value, value } : null}
        placeholder={`Select or create ${label.toLowerCase()}`}
        className="w-full rounded"
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: '#f3f4f6',
            borderColor: '#e5e7eb',
          }),
        }}
      />
    </div>
  );
};

// SKU Dropdown Component for table cells
const SKUDropdown = ({ value, onChange, options }) => {
  const formattedOptions = options?.map((item) => ({ 
    label: item.code || 'No Code', 
    value: item.code || '',
    item: item // Store full item data for later use
  })) || [];

  const handleChange = (selectedOption) => {
    onChange(selectedOption?.value || '', selectedOption?.item || null);
  };

  return (
    <div style={{ minWidth: '150px' }}>
      <CreatableSelect
        isClearable
        isSearchable
        options={formattedOptions}
        onChange={handleChange}
        value={value ? { label: value, value } : null}
        placeholder="Select SKU"
        menuPortalTarget={document.body}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '32px',
            fontSize: '12px',
            border: '1px solid #d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': {
              borderColor: '#9ca3af',
            },
          }),
          valueContainer: (base) => ({
            ...base,
            padding: '2px 8px',
          }),
          input: (base) => ({
            ...base,
            margin: '0',
            paddingTop: '0',
            paddingBottom: '0',
          }),
          indicatorSeparator: (base) => ({
            ...base,
            display: 'none',
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: '30px',
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
            position: 'absolute',
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          option: (base, state) => ({
            ...base,
            fontSize: '12px',
            padding: '6px 12px',
            backgroundColor: state.isSelected 
              ? '#3b82f6' 
              : state.isFocused 
                ? '#e5e7eb' 
                : 'white',
            color: state.isSelected ? 'white' : '#374151',
            cursor: 'pointer',
          }),
        }}
        menuPlacement="auto"
        maxMenuHeight={200}
      />
    </div>
  );
};

const PurchaseForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [items, setItems] = useState([{ ...defaultItem }]);
  const [allItems, setAllItems] = useState([]); // Store all items from Firebase

  // Track if dropdowns have been loaded
  const [isLoaded, setIsLoaded] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    suppliers: [],
    paymentTerms: [],
    inclusiveTaxes: [],
    surfaces: [],
    gstTypes: [],
    billingAddresses: [],
    shippingAddresses: [],
    gstClaims: [],
    priceTypes: [],
  });

  // Function to fetch all items from Firebase
  const fetchAllItems = async () => {
    try {
      const itemsCollection = collection(db, 'items'); // Adjust collection name as needed
      const itemsSnapshot = await getDocs(itemsCollection);
      const itemsList = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllItems(itemsList);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items from database');
    }
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...defaultItem }]);

  const updateItem = (index, field, value, selectedItem = null) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // If SKU is selected and we have item data, auto-fill other fields
    if (field === 'sku' && selectedItem) {
      console.log(selectedItem.purchasePrice, selectedItem.tax);
      updated[index] = {
        ...updated[index],
        name: selectedItem.name || '',
        mrp: parseFloat(selectedItem.mrp) || 0,
        gst: parseFloat(selectedItem.tax) || 0,
        purchasePrice: parseFloat(selectedItem.purchasePrice) || parseFloat(selectedItem.mrp) || 0,

        // Add other fields that should be auto-filled from the selected item
      };

      console.log(updated[index].finalAmount, selectedItem.tax);

    }
    updated[index] = {
        ...updated[index],
        gstAmount: parseFloat(
          ((parseFloat(updated[index].purchasePrice) || 0) * ((parseFloat(updated[index].gst) || 0) / 100)).toFixed(2)),
        finalAmount: parseFloat(
          ((parseFloat(updated[index].purchasePrice) || 0) * (1 + (parseFloat(updated[index].gst) || 0) / 100)).toFixed(2)),
        // Add other fields that should be auto-filled from the selected item
      };
    setItems(updated);
  };

  const handleAddItem = () => {
    setTableData([...tableData, {...formData}]);
    
    // Reset form for next entry
    setFormData({
      poNumber: '',
      itemSKUCode: '',
      particular: '',
      batchNumber: '',
      unitQty: 1,
      mou: 'STD',
      purchasePrice: 0,
      mrp: 0,
      margin: 0,
      salePrice: 0,
      discount: 0,
      freight: 0,
      beforeTax: 0,
      gst: 5,
      gstAmount: 0,
      finalAmount: 0
    });
  };
  
  const loadDropdownData = async () => {
    if (isLoaded && !loading) return;
    
    try {
      setLoading(true);
      
      // Fetch all dropdown values in parallel
      const fetchedValues = await Promise.all(
        DROPDOWN_KEYS.map((key) => fetchDropdownValues(`${key}`))
      );
      
      // Update state with fetched values
      const dropdownData = DROPDOWN_KEYS.reduce((acc, key, index) => {
        acc[`${key}`] = fetchedValues[index] || [];
        return acc;
      }, {});
      
      setDropdowns(dropdownData);
      
      // Also fetch all items for SKU dropdown
      await fetchAllItems();
      
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

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    purchaseNumber: '', // Will be set to serial number
    manualNumber: '',
    fashion: 'In Fashion',
    purchaseDate: today,
    deliveryDate: today,
    fashionDate: today,
    supplier: '',
    paymentTerms: '',
    inclusiveTax: 'Yes',
    surface: 'By Surface',
    gstType: '',
    billingAddress: '',
    shippingAddress: '',
    gstClaim: '',
    invoiceNumber: '',
    accountEmail: '',
    remarks: '',
    priceType: 'STD Price',
    authorized: false,
    items: [],
  });

  // Fetch the latest purchase number and set the next serial
  useEffect(() => {
    const fetchLatestPurchaseNumber = async () => {
      try {
        const purchasesCol = collection(db, 'purchases');
        const purchasesSnapshot = await getDocs(purchasesCol);
        let maxNumber = 0;
        purchasesSnapshot.forEach(doc => {
          const num = parseInt(doc.data().purchaseNumber, 10);
          if (!isNaN(num) && num > maxNumber) maxNumber = num;
        });
        setFormData(prev => ({
          ...prev,
          purchaseNumber: (maxNumber + 1).toString().padStart(6, '0')
        }));
      } catch (err) {
        // fallback if error
        setFormData(prev => ({
          ...prev,
          purchaseNumber: '000001'
        }));
      }
    };
    fetchLatestPurchaseNumber();
    // eslint-disable-next-line
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    try {
      setLoading(true);
      
      const updatedFormData = {
        ...formData,
        items: items, // Include the items array
        createdAt: Timestamp.now()
      };
      
      // Persist dropdown values
      const savePromises = DROPDOWN_KEYS
        .filter((key) => formData[key])
        .map((key) => saveDropdownValue(`${key}s`, formData[key]));

      await Promise.all(savePromises);
      
      // Save Purchase
      const id = await savePurchase(updatedFormData);
      console.log('Purchase saved with ID:', id);
      alert('Purchase saved!');
      
      setLoading(false);
    } catch (err) {
      console.error('Error saving Purchase:', err);
      setError(err.message);
      setLoading(false);
      alert('Error saving Purchase: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-lg text-gray-900">
      <h1 className="text-3xl font-bold text-center text-indigo-900 mb-6">CREATE PURCHASE</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="bg-purple-100 p-4 rounded-lg mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold">Basic Information</h2>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            Submit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Number</label>
            <input
              type="text"
              name="purchaseNumber"
              value={formData.purchaseNumber}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Manual Number</label>
            <input
              type="text"
              name="manualNumber"
              value={formData.manualNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fashion</label>
            <input
              type="text"
              name="fashion"
              value={formData.fashion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Date</label>
            <div className="relative">
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-100 border rounded"
              />
              <div className="absolute right-2 top-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Date</label>
            <div className="relative">
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-100 border rounded"
              />
              <div className="absolute right-2 top-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date</label>
            <div className="relative">
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-100 border rounded"
              />
              <div className="absolute right-2 top-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Supplier Information Section */}
        <div className="bg-purple-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold">Supplier Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <CreatableDropdown
              label="Supplier"
              name="supplier"
              value={formData.supplier}
              options={dropdowns.suppliers || []}
              onChange={handleDropdownChange}
              isRequired={true}
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="Payment Terms"
              name="paymentTerms"
              value={formData.paymentTerms}
              options={dropdowns.paymentTerms || []}
              onChange={handleDropdownChange}
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="Inclusive Tax"
              name="inclusiveTax"
              value={formData.inclusiveTax}
              options={dropdowns.inclusiveTaxes || ['Yes', 'No']}
              onChange={handleDropdownChange}
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="Surface"
              name="surface"
              value={formData.surface}
              options={dropdowns.surfaces || ['By Surface']}
              onChange={handleDropdownChange}
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="Billing Address"
              name="billingAddress"
              value={formData.billingAddress}
              options={dropdowns.billingAddresses || []}
              onChange={handleDropdownChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">GST Type</label>
            <input
              type="text"
              name="gstType"
              value={formData.gstType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 border rounded"
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="GST Claim"
              name="gstClaim"
              value={formData.gstClaim}
              options={dropdowns.gstClaims || ['Select GST Claim']}
              onChange={handleDropdownChange}
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="Location"
              name="location"
              value={formData.location}
              options={dropdowns.locations || ['Lucknow']}
              onChange={handleDropdownChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice/Ref Number
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-gray-100 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Account Email</label>
            <input
              type="email"
              name="accountEmail"
              value={formData.accountEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 border rounded"
            />
          </div>
          
          <div>
            <CreatableDropdown
              label="Price Type"
              name="priceType"
              value={formData.priceType}
              options={dropdowns.priceTypes || ['STD Price']}
              onChange={handleDropdownChange}
              isRequired={true}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Shipping Address</label>
            <textarea
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 border rounded h-24"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 border rounded h-24"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Upload Document</label>
            <div className="flex gap-2">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
              />
              <label htmlFor="fileUpload" className="flex-1 px-3 py-2 bg-gray-100 border rounded cursor-pointer text-gray-500">
                Click to add document
              </label>
            </div>
          </div>
        </div>
        
        {/* Item Table Section */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Item
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Barcode Scan
            </button>
            
            <div className="flex flex-1 gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 rounded"
              >
                Choose File
              </button>
              <div className="flex-1 flex items-center px-4 border border-gray-300 rounded text-gray-500">
                no file selected
              </div>
            </div>
            
            <button
              type="button"
              className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Upload
            </button>
          </div>
          
          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-blue-900 text-white text-sm">
                  {["PO Number", "SKU", "Particular", "Batch", "Qty", "MOU", "PurchasePrice", "MRP", "Margin", "Sale Price", "Discount", "Freight", "Before Tax", "GST", "GSTAmount", "FinalAmount", "Actions"].map((header) => (
                    <th key={header} className="border px-2 py-1" style={{ 
                      width: header === 'SKU' ? '150px' : header === 'Actions' ? '60px' : 'auto',
                      minWidth: header === 'SKU' ? '150px' : '80px'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="text-center text-sm">
                    {Object.keys(defaultItem).map((field) => (
                      <td key={field} className="border px-1 py-1" style={{ 
                        minWidth: field === 'sku' ? '150px' : '80px',
                        position: field === 'sku' ? 'relative' : 'static'
                      }}>
                        {field === 'sku' ? (
                          <SKUDropdown
                            value={item[field]}
                            onChange={(value, selectedItem) => updateItem(idx, field, value, selectedItem)}
                            options={allItems}
                          />
                        ) : uneditablesItemDetails.includes(field) ? (
                          <input
                            disabled={true}
                            type={typeof defaultItem[field] === "number" ? "number" : "text"}
                            value={item[field]}
                            onChange={(e) => updateItem(idx, field, e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs"
                            style={{ minWidth: '70px' }}
                          />
                        ):(
                          <input
                            type={typeof defaultItem[field] === "number" ? "number" : "text"}
                            value={item[field]}
                            onChange={(e) => updateItem(idx, field, e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs"
                            style={{ minWidth: '70px' }}
                          />
                        )}
                      </td>
                    ))}
                    <td className="border px-1 py-1" style={{ width: '60px' }}>
                      <button 
                        type="button"
                        onClick={() => removeItem(idx)} 
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Item"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;