// Represents a beneficiary returned by the API.
export interface Beneficiary {
  beneficiaryId: number;
  customerId: number;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  bankName: string;
  ifscCode: string;
  beneficiaryStatus: string;
  createdDate: string;
  modifiedDate?: string;
}