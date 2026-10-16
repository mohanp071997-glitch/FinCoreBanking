
export interface ReviewActivityResponse {
  accountOpeningApplicationId: number;
  applicationRequestId: string;
  customerName: string;
  email: string;
  reviewDecision: string;
  comments: string | null;
  reviewedAtUtc: string;
}
