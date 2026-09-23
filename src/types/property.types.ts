export interface Property {
  id: string;
  company_id: string;
  name: string;
  code: string;
  property_type: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  property_id: string;
  name: string;
  code: string;
  floors: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_type_id: string | null;
  unit_number: string;
  floor: number | null;
  monthly_rent: string;
  deposit_amount: string;
  status: "VACANT" | "OCCUPIED" | "RESERVED" | "MAINTENANCE" | "INACTIVE";
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  bedrooms: number;
  bathrooms: string;
  description: string | null;
}
