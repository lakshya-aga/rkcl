'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Trash2 } from 'lucide-react';

const InvoiceCreator = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    category: 'In Fashion',
    date1: '2025-05-29',
    date2: '2025-05-29',
    poNumber: '',
    customerType: 'CASH A/C',
    customerName: '',
    mobileNumber: '',
    inclusiveTax: 'Local',
    assignedTo: 'Shivam Singh',
    taxInvoice: '',
    paymentTerms: 'Select Terms Of Payment',
    bySupplier: 'By Surface',
    accountEmail: '',
    vehicleNumber: '',
    exportWithoutIGST: 'Lucknow',
    lucknowLocation: 'Lucknow',
    remarks: '',
    billingAddress: 'Lucknow\nLucknow\nIndia Uttar Pradesh 226016',
    shippingAddress: 'Lucknow\nLucknow\nIndia Uttar Pradesh 226016'
  });

  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    totalQuantity: 0,
    billAmount: 0,
    roundOff: 0
  });

  const [isAuthorized, setIsAuthorized] = useState(false);

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      refCode: '',
      itemSKUCode: '',
      particular: '',
      description: '',
      batchNumber: '',
      stockQty: 0,
      unitQty: 0,
      qty: 0,
      mou: '',
      mrp: 0,
      discountPercent: 0,
      discountAmount: 0,
      bulkDiscountPercent: 0,
      bulkDiscountAmount: 0,
      gst: 0,
      gstAmount: 0,
      finalAmount: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate amounts when relevant fields change
        if (['qty', 'mrp', 'discountPercent', 'bulkDiscountPercent', 'gst'].includes(field)) {
          const qty = parseFloat(updatedItem.qty) || 0;
          const mrp = parseFloat(updatedItem.mrp) || 0;
          const discountPercent = parseFloat(updatedItem.discountPercent) || 0;
          const bulkDiscountPercent = parseFloat(updatedItem.bulkDiscountPercent) || 0;
          const gst = parseFloat(updatedItem.gst) || 0;
          
          const baseAmount = qty * mrp;
          const discountAmount = (baseAmount * discountPercent) / 100;
          const afterDiscount = baseAmount - discountAmount;
          const bulkDiscountAmount = (afterDiscount * bulkDiscountPercent) / 100;
          const afterBulkDiscount = afterDiscount - bulkDiscountAmount;
          const gstAmount = (afterBulkDiscount * gst) / 100;
          const finalAmount = afterBulkDiscount + gstAmount;
          
          updatedItem.discountAmount = discountAmount;
          updatedItem.bulkDiscountAmount = bulkDiscountAmount;
          updatedItem.gstAmount = gstAmount;
          updatedItem.finalAmount = finalAmount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculate totals whenever items change
  useEffect(() => {
    const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    const billAmount = items.reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0);
    const roundOff = Math.round(billAmount) - billAmount;
    
    setTotals({
      totalQuantity: totalQuantity.toFixed(3),
      billAmount: billAmount.toFixed(2),
      roundOff: roundOff.toFixed(2)
    });
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-semibold text-center">CREATE INVOICE</h1>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Invoice Number</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.category}
                  onChange={(e) => setInvoiceData({...invoiceData, category: e.target.value})}
                >
                  <option>In Fashion</option>

                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={invoiceData.date1}
                    onChange={(e) => setInvoiceData({...invoiceData, date1: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={invoiceData.date2}
                    onChange={(e) => setInvoiceData({...invoiceData, date2: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">PO Number</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.poNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, poNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.customerType}
                  onChange={(e) => setInvoiceData({...invoiceData, customerType: e.target.value})}
                >
                  <option>CASH A/C</option>
                  <option>CREDIT A/C</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.customerName}
                  required={true}
                  onChange={(e) => setInvoiceData({...invoiceData, customerName: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  required={true}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.mobileNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, mobileNumber: e.target.value})}
                />
              </div>
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.inclusiveTax}
                  onChange={(e) => setInvoiceData({...invoiceData, inclusiveTax: e.target.value})}
                >
                  <option>Local</option>
                  <option>Interstate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.paymentTerms}
                  onChange={(e) => setInvoiceData({...invoiceData, paymentTerms: e.target.value})}
                  required={true}
                >
                  <option>Select Terms Of Payment</option>
                  <option>GPay</option>
                  <option>Card</option>
                  <option>Cash</option>
                  <option>Advance</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.bySupplier}
                  onChange={(e) => setInvoiceData({...invoiceData, bySupplier: e.target.value})}
                >
                  <option>By Surface</option>
                  <option>By Air</option>
                  <option>By Sea</option>
                </select>
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Account Email"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.accountEmail}
                  onChange={(e) => setInvoiceData({...invoiceData, accountEmail: e.target.value})}
                />
              </div>
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.assignedTo}
                  onChange={(e) => setInvoiceData({...invoiceData, assignedTo: e.target.value})}
                >
                  <option>Select Salesman</option>
                  <option>Goldie</option>
                  <option>Kiran</option>
                  <option>Laxmi</option>
                  <option>Manish</option>
                  <option>Navneet</option>
                  <option>Shivam Singh</option>
                  <option>Sunaina</option>
                  <option>Self</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.exportWithoutIGST}
                  onChange={(e) => setInvoiceData({...invoiceData, exportWithoutIGST: e.target.value})}
                >
                  <option>Lucknow</option>
                  <option>Delhi</option>
                  <option>Mumbai</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={invoiceData.lucknowLocation}
                  onChange={(e) => setInvoiceData({...invoiceData, lucknowLocation: e.target.value})}
                >
                  <option>Lucknow</option>
                  <option>Other Location</option>
                </select>
              </div>
              <div>
                <textarea
                  placeholder="Remarks"
                  className="w-full p-2 border border-gray-300 rounded-md h-10"
                  value={invoiceData.remarks}
                  onChange={(e) => setInvoiceData({...invoiceData, remarks: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Tax Invoice"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={invoiceData.taxInvoice}
                    onChange={(e) => setInvoiceData({...invoiceData, taxInvoice: e.target.value})}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Vehicle Number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={invoiceData.vehicleNumber}
                    onChange={(e) => setInvoiceData({...invoiceData, vehicleNumber: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <textarea
                  placeholder="Billing Address"
                  className="w-full p-2 border border-gray-300 rounded-md h-20"
                  value={invoiceData.billingAddress}
                  onChange={(e) => setInvoiceData({...invoiceData, billingAddress: e.target.value})}
                />
              </div>
              <div>
                <textarea
                  placeholder="Shipping Address"
                  className="w-full p-2 border border-gray-300 rounded-md h-20"
                  value={invoiceData.shippingAddress}
                  onChange={(e) => setInvoiceData({...invoiceData, shippingAddress: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                />
                <span className="text-sm font-medium text-blue-600">Authorized?</span>
              </label>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={addNewItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add new record
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  <Search size={16} />
                  Search Item
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-400 px-2 py-1 text-sm rounded">Scan Barcode</span>
                  <span className="bg-blue-600 text-white px-2 py-1 text-sm rounded">INC</span>
                </div>
                <div className="flex gap-2">
                  <select className="p-2 border border-gray-300 rounded-md">
                    <option>Retail Price</option>
                    <option>Wholesale Price</option>
                  </select>
                  <select className="p-2 border border-gray-300 rounded-md">
                    <option>Item</option>
                    <option>Service</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-blue-900 text-white">
                  <tr className="px-2 py-2 text-xs font-medium">
                    <th>Ref Code</th>
                    <th>Item SKU Code</th>
                    <th>Particular</th>
                    <th>Description</th>
                    <th>BatchNumber</th>
                    <th>Stock Qty</th>
                    <th>Unit Qty</th>
                    <th>Qty</th>
                    <th>MOU</th>
                    <th>Mrp</th>
                    <th>Discount %</th>
                    <th>Discount Amt</th>
                    <th>Bulk Dis %</th>
                    <th>Bulk Dis Amt</th>
                    <th>GST</th>
                    <th>GSTAmount</th>
                    <th>FinalAmount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 px-2 py-2">

                      <td>
                        <input
                          type="text"
                          className="w-20 p-1 border border-gray-300 rounded text-xs"
                          value={item.refCode}
                          onChange={(e) => updateItem(item.id, 'refCode', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-20 p-1 border border-gray-300 rounded text-xs"
                          value={item.itemSKUCode}
                          onChange={(e) => updateItem(item.id, 'itemSKUCode', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-24 p-1 border border-gray-300 rounded text-xs"
                          value={item.particular}
                          onChange={(e) => updateItem(item.id, 'particular', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-24 p-1 border border-gray-300 rounded text-xs"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-20 p-1 border border-gray-300 rounded text-xs"
                          value={item.batchNumber}
                          onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.stockQty}
                          onChange={(e) => updateItem(item.id, 'stockQty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.unitQty}
                          onChange={(e) => updateItem(item.id, 'unitQty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.mou}
                          onChange={(e) => updateItem(item.id, 'mou', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="w-20 p-1 border border-gray-300 rounded text-xs"
                          value={item.mrp}
                          onChange={(e) => updateItem(item.id, 'mrp', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(item.id, 'discountPercent', e.target.value)}
                        />
                      </td>
                      <td>
                        <span className="text-xs">{item.discountAmount.toFixed(2)}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.bulkDiscountPercent}
                          onChange={(e) => updateItem(item.id, 'bulkDiscountPercent', e.target.value)}
                        />
                      </td>
                      <td>
                        <span className="text-xs">{item.bulkDiscountAmount.toFixed(2)}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="w-16 p-1 border border-gray-300 rounded text-xs"
                          value={item.gst}
                          onChange={(e) => updateItem(item.id, 'gst', e.target.value)}
                        />
                      </td>
                      <td>
                        <span className="text-xs">{item.gstAmount.toFixed(2)}</span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold">{item.finalAmount.toFixed(2)}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Summary */}
          <div className="mb-6">
            <div className="bg-blue-900 text-white p-2 rounded-t-md">
              <span className="text-sm font-medium">GST Amount | CGST % | CGST Amount | SGST % | SGST Amount | IGST % | IGST Amount</span>
            </div>
            <div className="border border-gray-300 rounded-b-md p-4 bg-gray-50 min-h-20">
              {/* Tax calculations would be displayed here */}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <select className="w-full p-2 border border-gray-300 rounded-md mb-4">
                <option>Summary</option>
                <option>Detailed</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Quantity:</span>
                <span>{totals.totalQuantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Bill Amount:</span>
                <span>{totals.billAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Round Off:</span>
                <span>{totals.roundOff}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Save Invoice
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Preview
            </button>
            <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreator;