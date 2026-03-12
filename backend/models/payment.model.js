const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  amount: Number,
  paymentMethod: String,
  receiptNumber: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
