import { Router } from "express";
import * as c from "../controllers/tenant.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  tenantCreateSchema,
  tenantUpdateSchema,
  tenantDocumentCreateSchema,
} from "../schemas/tenant.schema";

const r = Router();
r.use(authorize("tenant", "view"));
r.get("/", c.list);
r.post("/", validateBody(tenantCreateSchema), c.create);
r.get("/:id", c.get);
r.patch("/:id", validateBody(tenantUpdateSchema), c.update);
r.delete("/:id", c.remove);
r.get("/:tenantId/documents", c.listDocuments);
r.post(
  "/:tenantId/documents",
  validateBody(tenantDocumentCreateSchema),
  c.addDocument,
);
r.delete("/documents/:id", c.removeDocument);
export default r;
