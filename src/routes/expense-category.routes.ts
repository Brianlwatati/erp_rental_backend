import { Router } from "express";
import * as c from "../controllers/expense.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import {
  expenseCategoryCreateSchema,
  expenseCategoryUpdateSchema,
} from "../schemas/expense.schema";

const r = Router();
r.use(authorize("expense", "view"));
r.get("/", c.listCategories);
r.post("/", validateBody(expenseCategoryCreateSchema), c.createCategory);
r.get("/:id", c.getCategory);
r.patch("/:id", validateBody(expenseCategoryUpdateSchema), c.updateCategory);
r.delete("/:id", c.removeCategory);
export default r;
