export type Maybe<T> = T | null;

export interface Company {
  id: string;
  name: string;
  slug: string;
  branding?: Maybe<CompanyBranding>;
  pricing: Record<string, unknown>;
  cancellationPolicy?: Maybe<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyBranding {
  logo?: Maybe<string>;
  primaryColor?: Maybe<string>;
  secondaryColor?: Maybe<string>;
}

export interface Court {
  id: string;
  companyId: string;
  name: string;
  defaultNetHeight?: Maybe<number>;
  location?: Maybe<string>;
  status: CourtStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum CourtStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

// Add more types as needed... 
