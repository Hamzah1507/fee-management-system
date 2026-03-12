const router = require("express").Router();
const c = require("../controllers/student.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, c.addStudent);
router.get("/", auth, c.getStudents);
router.get("/:id", auth, c.getStudentById);
router.put("/:id", auth, c.updateStudent);
router.delete("/:id", auth, c.deleteStudent);

module.exports = router;