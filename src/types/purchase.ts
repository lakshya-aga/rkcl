import { Item } from './item';
export interface Purchase {
  id: string;
  Supplier : string;
  PaymentTerms : string;
  InclusiveTax : string;
  DispatchMedium : string;
  BillingAddress : string;
  GSTType : string;
  GSTClaim : string;
  Location : string;
  InvoiceNumber : string;
  Email : string;
  PriceType : string;
  Items: Array<{Item: Item,
                Qty: number;
                PurchasePrice: number;
                SalePrice: number;
  }>

}
