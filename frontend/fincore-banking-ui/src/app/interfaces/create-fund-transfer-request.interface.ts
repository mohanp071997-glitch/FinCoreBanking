// Represents the data required to create a fund transfer.
export interface CreateFundTransferRequest {
  fromAccountId: number;
  beneficiaryId: number;
  amount: number;
  transferDescription?: string;
}