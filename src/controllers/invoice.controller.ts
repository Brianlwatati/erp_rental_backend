import { Request, Response, NextFunction } from "express";
import * as s from "../services/invoice.service";
const c = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function list(r: Request, res: Response, n: NextFunction) {
  try {
    const { status, tenantId, leaseId } = r.query as Record<
      string,
      string | undefined
    >;
    res.json({
      success: true,
      data: await s.listInvoices(c(r), { status, tenantId, leaseId }),
    });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getInvoice(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res
      .status(201)
      .json({ success: true, data: await s.createInvoice(c(r), r.body) });
  } catch (e) {
    n(e);
  }
}
export async function update(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateInvoice(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function issue(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.issueInvoice(c(r), param(r, "id")),
    });
  } catch (e) {
    n(e);
  }
}
export async function cancel(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.cancelInvoice(c(r), param(r, "id")),
    });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteInvoice(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
export async function listItems(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.listInvoiceItems(c(r), param(r, "invoiceId")),
    });
  } catch (e) {
    n(e);
  }
}
export async function addItem(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.addInvoiceItem(c(r), param(r, "invoiceId"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeItem(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.deleteInvoiceItem(c(r), param(r, "id")),
    });
  } catch (e) {
    n(e);
  }
}
