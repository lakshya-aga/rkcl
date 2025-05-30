import { ItemListSale } from './itemListSale';
export interface sale {
  id: string;
  customer: string;
  customerPhone: string;
  paymentTerms: string;
  itemSku: string;
  qty: number;
  timestamp: string;
  purchaseId: string;
  prchasePrice: number;
  SaleItems: Array<{
    Items: ItemListSale;}>;
}
