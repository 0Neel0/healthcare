import express from 'express';
import { getDashboardStats, getFinancialReport, getDoctorPerformance } from '../controllers/report.controller.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/financial', getFinancialReport);
router.get('/doctors', getDoctorPerformance);

export default router;
