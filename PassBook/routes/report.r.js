const app = require("express");
const router = app.Router();

const report = require('../controllers/report.c');

router.get('/', report.getReport);
router.get('/daily-report', report.getDailyReport);
router.get("/monthly-report", report.getMonthlyReport);
router.post('/daily-report', report.postDailyReport);
router.post("/monthly-report", report.postMonthlyReport);
module.exports = router;