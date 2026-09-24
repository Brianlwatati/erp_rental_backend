import { Router } from "express";
import * as c from "../controllers/expense.controller";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validation.middleware";
import { expenseCategoryCreateSchema, expenseCategoryUpdateSchema } from "../schemas/expense.schema";

const r = Router();
r.get("/", authorize("expense", "view"), c.listCategories);
r.post("/", authorize("expense", "create"), validateBody(expenseCategoryCreateSchema), c.createCategory);
r.get("/:id", authorize("expense", "view"), c.getCategory);
r.patch("/:id", authorize("expense", "update"), validateBody(expenseCategoryUpdateSchema), c.updateCategory);
r.delete("/:id", authorize("expense", "delete"), c.removeCategory);
export default r;
