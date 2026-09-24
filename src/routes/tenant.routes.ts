import { Router } from "express";
import * as c from "../controllers/tenant.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import { tenantCreateSchema, tenantUpdateSchema, tenantDocumentCreateSchema } from "../schemas/tenant.schema";

const r = Router();
r.get("/", authorize("tenant", "view"), c.list);
r.post("/", authorize("tenant", "create"), validateBody(tenantCreateSchema), c.create);
r.get("/:id", authorize("tenant", "view"), c.get);
r.patch("/:id", authorize("tenant", "update"), validateBody(tenantUpdateSchema), c.update);
r.delete("/:id", authorize("tenant", "delete"), c.remove);
r.get("/:tenantId/documents", authorize("tenant", "view"), c.listDocuments);
r.post("/:tenantId/documents", authorize("tenant", "update"), validateBody(tenantDocumentCreateSchema), c.addDocument);
r.delete("/documents/:id", authorize("tenant", "update"), c.removeDocument);
export default r;
