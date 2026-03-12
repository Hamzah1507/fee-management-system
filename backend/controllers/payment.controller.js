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
