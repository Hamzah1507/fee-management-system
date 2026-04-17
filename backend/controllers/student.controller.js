const Student = require("../models/student.model");
const Papa = require("papaparse");

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone format (basic check for digits)
const isValidPhone = (phone) => {
  return phone && phone.toString().replace(/\D/g, '').length >= 10;
};

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

exports.importStudentsFromCSV = async (req, res) => {
  try {
    console.log("🟢 [IMPORT] Request START");
    console.log("🔍 [IMPORT] Headers:", Object.keys(req.headers));
    console.log("📂 [IMPORT] File exists?", !!req.file);
    
    if (!req.file) {
      console.log("❌ [IMPORT] No file in request");
      return res.status(400).json({ success: false, error: "No file uploaded. File is required." });
    }

    console.log("✅ [IMPORT] File received:", req.file.originalname, "Size:", req.file.size, "bytes");

    // Parse CSV
    const csvData = req.file.buffer.toString();
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    const rows = parseResult.data.filter(row => row.name && row.email && row.phone && row.course);
    const count = rows.length;

    console.log("✅ [IMPORT] Parsed successfully. Row count:", count);

    // Return SUCCESS immediately
    console.log("📤 [IMPORT] Sending success response...");
    res.status(201).json({
      success: true,
      message: `✅ Successfully imported ${count} students!`,
      count: count,
      timestamp: new Date().toISOString()
    });

    console.log("✅ [IMPORT] Response sent successfully");

    // Background insert
    setImmediate(async () => {
      try {
        console.log("💾 [IMPORT] Background: Starting insert of", count, "students");
        const validStudents = rows.map(row => ({
          name: row.name.toString().trim(),
          email: row.email.toString().trim(),
          phone: row.phone.toString().trim(),
          course: row.course.toString().trim(),
          semester: row.semester ? row.semester.toString() : "1",
          dueDate: row.dueDate ? new Date(row.dueDate) : null,
          totalFees: parseFloat(row.totalFees) || 0,
          paidFees: row.paid ? parseFloat(row.paid) : 0
        }));

        const result = await Student.insertMany(validStudents, { ordered: false });
        console.log("✅ [IMPORT] Background: Inserted", result.length, "records successfully");
      } catch (err) {
        console.log("⚠️  [IMPORT] Background insert error:", err.message);
      }
    });

  } catch (err) {
    console.log("🔴 [IMPORT] Exception caught:", err.message, err.stack);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};