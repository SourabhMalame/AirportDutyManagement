const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDutyReport, getSubordinateReport, exportDutyPDF, exportSubordinatePDF } = require('../controllers/reportController');

router.use(protect);

router.get('/duties', getDutyReport);
router.get('/duties/pdf', exportDutyPDF);
router.get('/subordinates', adminOnly, getSubordinateReport);
router.get('/subordinates/pdf', adminOnly, exportSubordinatePDF);

module.exports = router;
