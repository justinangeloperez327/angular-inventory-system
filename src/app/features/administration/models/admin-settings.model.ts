export type StockCountConcurrencyPolicy = 'freeze' | 'reconcile';

export interface ApplicationSettings {
  readonly organizationName: string;
  readonly timezone: string;
  readonly currencyCode: string;
  readonly defaultPageSize: number;
  readonly allowNegativeStock: boolean;
  readonly stockCountConcurrencyPolicy: StockCountConcurrencyPolicy;
  readonly updatedAt?: string;
  readonly updatedBy?: {
    readonly id?: string;
    readonly name: string;
  };
}

export interface ApplicationSettingsUpdateRequest {
  readonly organizationName: string;
  readonly timezone: string;
  readonly currencyCode: string;
  readonly defaultPageSize: number;
  readonly allowNegativeStock: boolean;
  readonly stockCountConcurrencyPolicy: StockCountConcurrencyPolicy;
}

export interface ApplicationSettingsOptions {
  readonly timezones: readonly string[];
  readonly currencies: readonly string[];
}
