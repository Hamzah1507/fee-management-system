const router = require("express").Router();
const c = require("../controllers/student.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");

// Import route - test without multer first
router.post("/import", (req, res) => {
  console.log("🎯 IMPORT ROUTE HIT!", new Date().toISOString());
  res.json({ success: true, message: "Import route is accessible!" });
});

// Import route with file upload
router.post("/import-full", upload.single("file"), c.importStudentsFromCSV);

// Test endpoint - NO AUTH
router.get("/test/debug", (req, res) => {
  res.json({ status: "✅ Route working!" });
});

// Other routes with auth
router.post("/", auth, c.addStudent);
router.get("/", auth, c.getStudents);
router.get("/:id", auth, c.getStudentById);
router.put("/:id", auth, c.updateStudent);
router.delete("/:id", auth, c.deleteStudent);

module.exports = router;