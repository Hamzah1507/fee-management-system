const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  course: String,
  semester: { type: String, default: "" },
  dueDate: { type: Date, default: null },
  totalFees: Number,
  paidFees: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);