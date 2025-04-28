import { Router } from "express";
import DesafioController from "../controllers/desafio_Controller.js";

const router = Router();

router.post("/users", DesafioController.insertUsers);
router.get("/superusers", DesafioController.searchSuperUsers);
router.get("/top-countries", DesafioController.getTopCountries);
router.get("/team-insights", DesafioController.getTeamInsights);
router.get("/active-users-per-day", DesafioController.getActiveUsersPerDay);
router.get("/evaluation", DesafioController.getEvaluation);
router.post("/flush", DesafioController.flushUsers);

export default router;
