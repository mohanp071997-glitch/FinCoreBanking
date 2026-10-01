// Represents a loan record.
export interface Loan {
  loanId: number;
  customerId: number;
  loanTypeId: number;
  loanTypeName: string;
  loanNumber: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  nextPaymentDate?: string;
  loanStatus: string;
  appliedDate: string;
  approvedDate?: string;
  closedDate?: string;
  createdDate: string;
  modifiedDate?: string;
}

// Represents an available loan type.
export interface LoanType {
  loanTypeId: number;
  loanTypeName: string;
  interestRate: number;
  isActive: boolean;
  createdDate: string;
}