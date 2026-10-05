export interface SupplierSummary {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly contactName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly countryCode?: string;
  readonly active: boolean;
  readonly updatedAt: string;
}

export interface SupplierDetail extends SupplierSummary {
  readonly taxNumber?: string;
  readonly addressLine1?: string;
  readonly addressLine2?: string;
  readonly city?: string;
  readonly stateProvince?: string;
  readonly postalCode?: string;
  readonly createdAt: string;
}

export interface SupplierUpsertRequest {
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

export interface SupplierStatusRequest {
  readonly active: boolean;
}
