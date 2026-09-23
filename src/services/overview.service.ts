import * as repo from "../repositories/overview.repository";

export const getCompanyOverview = (companyId: string) =>
  repo.findCompanyOverview(companyId);
