export interface Item {
  id: string;
  name: string;
  description: string;
  store: string;
  category: string;
  subCategory: string;
  brand: string;
  size: string;
  quality: string;
  color: string;
  itemType: 'raw' | 'finished';
  mrp: number;
  sellingPrice: number;
  cost: number;
  hsnCode: string;
  taxRate: number;
}
