export interface AdminPermissionOption {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
}

export interface AdminPermissionGroup {
  readonly name: string;
  readonly permissions: readonly AdminPermissionOption[];
}

export interface AdminRoleSummary {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly permissionCount: number;
  readonly userCount: number;
  readonly builtIn: boolean;
  readonly updatedAt: string;
}

export interface AdminRoleDetail extends AdminRoleSummary {
  readonly permissions: readonly string[];
  readonly createdAt: string;
}

export interface AdminRoleUpsertRequest {
  readonly name: string;
  readonly description?: string;
  readonly permissions: readonly string[];
}

export interface AdminRoleFormOptions {
  readonly permissionGroups: readonly AdminPermissionGroup[];
}
