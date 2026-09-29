// Represents a transaction returned by the API.
export interface Transaction {
  transactionId: number;
  accountId: number;
  transactionReference: string;
  transactionType: string;
  amount: number;
  balanceAfterTransaction: number;
  description?: string;
  transactionStatus: string;
  transactionDate: string;
  createdDate: string;
}