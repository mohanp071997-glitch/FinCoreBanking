// Represents a loan payment schedule item.
export interface LoanPayment {
  loanPaymentId: number;
  loanId: number;
  paymentNumber: number;
  dueDate: string;
  emiAmount: number;
  paymentStatus: string;
  paidDate?: string;
  paidAmount?: number;
  createdDate: string;
  modifiedDate?: string;
}