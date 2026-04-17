const Payment = require("../models/payment.model");
const Student = require("../models/student.model");

exports.collectPayment = async (req, res) => {
  const { studentId, amount, paymentMethod } = req.body;

  const payment = new Payment({
    student: studentId,
    amount,
    paymentMethod,
    receiptNumber: Date.now().toString()
  });

  await payment.save();

  await Student.findByIdAndUpdate(studentId, {
    $inc: { paidFees: amount }
  });

  res.status(201).json(payment);
};

exports.getPaymentsByStudent = async (req, res) => {
  const payments = await Payment.find({ student: req.params.studentId });
  res.json(payments);
};

exports.exportFeesAsCSV = async (req, res) => {
  try {
    // Export ALL students status, not just payments
    const students = await Student.find().sort({ name: 1 });

    if (students.length === 0) {
      return res.status(400).json({ error: "No student records found to export" });
    }

    // Build CSV header
    const csvHeader = "Student Name,Email,Phone,Course,Semester,Total Fees,Paid Amount,Pending Amount,Status,Due Date\n";

    // Build CSV rows
    const csvRows = students.map((student) => {
      const pending = (student.totalFees || 0) - (student.paidFees || 0);
      let status = "Pending";
      if (pending <= 0) status = "Fully Paid";
      else if (student.paidFees > 0) status = "Partial";

      const dueDate = student.dueDate ? new Date(student.dueDate).toLocaleDateString() : "N/A";

      // Escape quotes in data for CSV format
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return "";
        const stringValue = value.toString();
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      return [
        escapeCSV(student.name),
        escapeCSV(student.email),
        escapeCSV(student.phone),
        escapeCSV(student.course),
        escapeCSV(student.semester),
        student.totalFees || 0,
        student.paidFees || 0,
        pending,
        status,
        dueDate
      ].join(",");
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    // Set response headers for CSV download
    const filename = `fees-export-${new Date().toISOString().split('T')[0]}.csv`; // Force .csv extension
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
