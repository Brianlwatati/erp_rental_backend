import { Request, Response, NextFunction } from "express";
import * as s from "../services/expense.service";
const c = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function listCategories(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    res.json({ success: true, data: await s.listExpenseCategories(c(r)) });
  } catch (e) {
    n(e);
  }
}
export async function getCategory(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.getExpenseCategory(c(r), param(r, "id")),
    });
  } catch (e) {
    n(e);
  }
}
export async function createCategory(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    res.status(201).json({
      success: true,
      data: await s.createExpenseCategory(c(r), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function updateCategory(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    res.json({
      success: true,
      data: await s.updateExpenseCategory(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeCategory(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    await s.deleteExpenseCategory(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}

export async function listVendors(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.listVendors(c(r)) });
  } catch (e) {
    n(e);
  }
}
export async function getVendor(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getVendor(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function createVendor(r: Request, res: Response, n: NextFunction) {
  try {
    res
      .status(201)
      .json({ success: true, data: await s.createVendor(c(r), r.body) });
  } catch (e) {
    n(e);
  }
}
export async function updateVendor(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateVendor(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeVendor(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteVendor(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}

export async function listExpenses(r: Request, res: Response, n: NextFunction) {
  try {
    const { status, propertyId, categoryId } = r.query as Record<
      string,
      string | undefined
    >;
    res.json({
      success: true,
      data: await s.listExpenses(c(r), { status, propertyId, categoryId }),
    });
  } catch (e) {
    n(e);
  }
}
export async function getExpense(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getExpense(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function createExpense(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    res
      .status(201)
      .json({
        success: true,
        data: await s.createExpense(c(r), {
          ...r.body,
          createdBy: r.auth!.userId,
        }),
      });
  } catch (e) {
    n(e);
  }
}
export async function updateExpense(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    res.json({
      success: true,
      data: await s.updateExpense(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeExpense(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    await s.deleteExpense(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
