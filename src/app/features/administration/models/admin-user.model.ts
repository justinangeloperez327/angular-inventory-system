export interface AdminRoleOption {
  readonly id: string;
  readonly name: string;
}

export interface AdminUserSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly active: boolean;
  readonly roles: readonly AdminRoleOption[];
  readonly lastLoginAt?: string;
  readonly updatedAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  readonly createdAt: string;
}

export interface AdminUserUpsertRequest {
  readonly name: string;
  readonly email: string;
  readonly roleIds: readonly string[];
}

export interface AdminUserStatusRequest {
  readonly active: boolean;
}

export interface AdminUserFormOptions {
  readonly roles: readonly AdminRoleOption[];
}
