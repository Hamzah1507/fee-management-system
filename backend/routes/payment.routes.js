const router = require("express").Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, paymentController.collectPayment);
router.get("/export/all", authMiddleware, paymentController.exportFeesAsCSV);
router.get("/:studentId", authMiddleware, paymentController.getPaymentsByStudent);

module.exports = router;
