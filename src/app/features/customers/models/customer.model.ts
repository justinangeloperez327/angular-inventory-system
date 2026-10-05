export interface CustomerSummary {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly contactName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly active: boolean;
  readonly updatedAt: string;
}

export interface CustomerDetail extends CustomerSummary {
  readonly taxNumber?: string;
  readonly addressLine1?: string;
  readonly addressLine2?: string;
  readonly city?: string;
  readonly stateProvince?: string;
  readonly postalCode?: string;
  readonly countryCode?: string;
  readonly createdAt: string;
}

export interface CustomerUpsertRequest {
  readonly code: string;
  readonly name: string;
  readonly contactName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly taxNumber?: string;
  readonly addressLine1?: string;
  readonly addressLine2?: string;
  readonly city?: string;
  readonly stateProvince?: string;
  readonly postalCode?: string;
  readonly countryCode?: string;
}

export interface CustomerStatusRequest {
  readonly active: boolean;
}
