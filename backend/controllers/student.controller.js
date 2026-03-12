const Student = require("../models/student.model");

exports.addStudent = async (req, res) => {
  try {
    const { name, email, phone, course, semester, dueDate, totalFees, paid } = req.body;
    const student = new Student({ name, email, phone, course, semester, dueDate: dueDate || null, totalFees, paidFees: paid || 0 });
    await student.save();
    res.status(201).json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phone, course, semester, dueDate, totalFees, paidFees } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, course, semester, dueDate: dueDate || null, totalFees, paidFees },
      { new: true }
    );
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};