export interface Card {
  cardId: number;
  customerId: number;
  cardNumber: string;
  cardType: string;
  cardBrand: string;
  cardHolderName: string;
  expiryDate: string;
  cardStatus: string;
  availableLimit: number;
  usedAmount: number;
  createdDate: string;
  modifiedDate?: string;
}