export interface AccessTokenPayload {
  sub: string;
  roleName: string;
  companyId: string;
  roleCode: string;
  roleScope: string;
  roleScopeKey: string;
}

export interface AccessTokenUser {
  userId: string;
  companyId: string;
  roleName: string;
  roleCode: string;
  roleScope: string;
  roleScopeKey: string;
}
