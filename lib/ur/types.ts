/** Normalized company hit from UR open data (Phase 1). */
export type UrCompanyHit = {
  sourceId: string;
  legalName: string;
  registrationNumber: string;
  vatNumber?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string;
};

export type UrSearchResponse = {
  query: string;
  results: UrCompanyHit[];
  /** true when returning mock/stub data */
  stub: boolean;
  note?: string;
};
