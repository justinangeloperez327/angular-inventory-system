import { Permission } from '../permissions';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly Permission[];
}
