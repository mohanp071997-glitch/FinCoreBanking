// Represents an account returned by the API.
export interface Account {
  accountId: number;
  customerId: number;
  accountTypeId: number;
  accountTypeName: string;
  accountNumber: string;
  ifscCode: string;
  currentBalance: number;
  accountStatus: string;
  createdDate: string;
  modifiedDate?: string;
}
