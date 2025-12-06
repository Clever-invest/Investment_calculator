/**
 * Типы для калькулятора флиппинга
 */

export type PropertyType = 'apartment' | 'villa' | 'townhouse';
export type DealType = 'secondary' | 'offplan';

export interface PaymentScheduleItem {
  amount: number;
  date: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CalculatorParams {
  propertyName: string;
  location: string;
  propertyType: PropertyType;
  dealType: DealType;
  bedrooms: number;
  bathrooms: number;
  unitAreaSqft: number;
  plotAreaSqft: number;
  propertyImages: string[];
  purchasePrice: number;
  sellingPrice: number;
  dldFees: number;
  buyerCommission: number;
  sellerCommission: number;
  renovationBudget: number;
  contingency: number;
  renovationMonths: number;
  listingMonths: number;
  serviceChargeYearly: number;
  dewaAcMonthly: number;
  trusteeOfficeFee: number;
  targetReturn: number;
  marketGrowth: number;
  renovationComments: string;
  paidAmount: number;
  paymentSchedule: PaymentScheduleItem[];
}

export interface CostsBreakdown {
  purchase: number;
  dld: number;
  buyerCommission: number;
  buyerCommissionVAT: number;
  buyerCommissionTotal: number;
  renovation: number;
  serviceCharge: number;
  dewaAc: number;
  trusteeOfficeFee: number;
  total: number;
}

export interface RevenueBreakdown {
  sellingPrice: number;
  sellerCommission: number;
  sellerCommissionVAT: number;
  sellerCommissionTotal: number;
  net: number;
  remainingDebt?: number;
}

export interface ProfitMetrics {
  net: number;
  roi: number;
  irr: number;
}

export interface Calculations {
  costs: CostsBreakdown;
  revenue: RevenueBreakdown;
  profit: ProfitMetrics;
  breakEven: number;
  totalMonths: number;
  remainingDebt?: number;
}

export interface SavedProperty extends CalculatorParams {
  id: string;
  coordinates: Coordinates | null;
  calculations: Calculations;
  savedAt: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

export interface WaterfallDataItem {
  name: string;
  value: number;
  fill: string;
}

export interface SensitivityDataItem {
  variation: string;
  priceChange: number;
  renoChange: number;
}

export interface EarlyDiscountDataItem {
  week: number;
  weekLabel: string;
  discount: number;
  price: number;
  profit: number;
  roi: string;
  irr: string;
  totalMonths: string;
}

export interface CustomMetric {
  type: 'roi' | 'irr';
  value: string;
}

export const DEFAULT_PARAMS: CalculatorParams = {
  propertyName: '',
  location: '',
  propertyType: 'apartment',
  dealType: 'secondary',
  bedrooms: 1,
  bathrooms: 1,
  unitAreaSqft: 0,
  plotAreaSqft: 0,
  propertyImages: [],
  purchasePrice: 500000,
  sellingPrice: 700000,
  dldFees: 4,
  buyerCommission: 2,
  sellerCommission: 4,
  renovationBudget: 100000,
  contingency: 15,
  renovationMonths: 3,
  listingMonths: 2,
  serviceChargeYearly: 6000,
  dewaAcMonthly: 500,
  trusteeOfficeFee: 5000,
  targetReturn: 25,
  marketGrowth: 0,
  renovationComments: '',
  paidAmount: 350000,
  paymentSchedule: [],
};
