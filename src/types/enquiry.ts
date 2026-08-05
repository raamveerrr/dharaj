export const ENQUIRY_TYPES = [
  "Wholesale",
  "Distributor",
  "Retailer",
  "Bulk Order",
  "Corporate",
  "Restaurant/Cafe",
  "Other",
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const ENQUIRY_STATUSES = ["New", "Contacted", "Closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface BusinessEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  enquiryType: EnquiryType;
  message: string;
  status: EnquiryStatus;
  createdAt?: Date;
}

export interface BusinessEnquiryInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  enquiryType: EnquiryType;
  message: string;
}
