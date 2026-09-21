import { Request, Response, NextFunction } from "express";
import * as s from "../services/maintenance.service";
const c = (r: Request) => r.auth!.companyId;

export async function list(r: Request, res: Response, n: NextFunction) {
  try {
    const { status, unitId, propertyId } = r.query as Record<
      string,
      string | undefined
    >;
    res.json({
      success: true,
      data: await s.listRequests(c(r), { status, unitId, propertyId }),
    });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getRequest(c(r), r.params.id) });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res
      .status(201)
      .json({ success: true, data: await s.createRequest(c(r), r.body) });
  } catch (e) {
    n(e);
  }
}
export async function update(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateRequest(c(r), r.params.id, r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function assign(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.assignRequest(c(r), r.params.id, r.body.vendorId),
    });
  } catch (e) {
    n(e);
  }
}
export async function start(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.startRequest(c(r), r.params.id) });
  } catch (e) {
    n(e);
  }
}
export async function complete(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.completeRequest(c(r), r.params.id),
    });
  } catch (e) {
    n(e);
  }
}
export async function cancel(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.cancelRequest(c(r), r.params.id) });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteRequest(c(r), r.params.id);
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
export async function listCosts(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.listCosts(c(r), r.params.requestId),
    });
  } catch (e) {
    n(e);
  }
}
export async function addCost(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.addCost(c(r), r.params.requestId, r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeCost(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteCost(c(r), r.params.id);
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
