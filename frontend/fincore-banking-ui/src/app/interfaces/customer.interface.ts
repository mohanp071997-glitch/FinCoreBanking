// Represents a customer returned by the API.
export interface Customer {
  customerId: number;
  userId: number;
  customerNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  emergencyContactNumber: string;
  bloodGroup: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string;
}