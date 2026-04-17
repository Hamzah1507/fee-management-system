const Student = require("../models/student.model");
const Payment = require("../models/payment.model");

exports.getAnalytics = async (req, res) => {
  try {
    const students = await Student.find();

    const totalStudents = students.length;
    const fullyPaid = students.filter(s => s.paidFees >= s.totalFees && s.totalFees > 0).length;
    const partial = students.filter(s => s.paidFees > 0 && s.paidFees < s.totalFees).length;
    const now = new Date();
    const overdue = students.filter(s =>
      s.dueDate && new Date(s.dueDate) < now && s.paidFees < s.totalFees
    ).length;

    const totalFees = students.reduce((s, x) => s + (x.totalFees || 0), 0);
    const totalCollected = students.reduce((s, x) => s + (x.paidFees || 0), 0);
    const totalPending = totalFees - totalCollected;
    const collectionRate = totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0;

    // Last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyPayments = await Payment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthlyPayments.find(m => m._id.year === year && m._id.month === month);
      monthlyData.push({ label: monthNames[month - 1], amount: found ? found.total : 0 });
    }

    // Recent Transactions
    let recentTxDocs = await Payment.find()
      .populate("student", "name course semester")
      .sort({ createdAt: -1 })
      .limit(5);

    // Fallback: If no real payments, use students with paid fees (from import)
    if (recentTxDocs.length === 0) {
      const studentsWithFees = await Student.find({ paidFees: { $gt: 0 } }).sort({ updatedAt: -1 }).limit(5);
      recentTxDocs = studentsWithFees.map(s => ({
        amount: s.paidFees,
        paymentMethod: 'Imported',
        createdAt: s.updatedAt || new Date(),
        student: s
      }));
    }

    const recentTransactions = recentTxDocs.map(tx => ({
      studentName: tx.student ? tx.student.name : "Unknown",
      course: tx.student ? tx.student.course : "",
      semester: tx.student ? tx.student.semester : "",
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      createdAt: tx.createdAt
    }));

    // Course breakdown
    const courseMap = {};
    students.forEach(s => {
      const course = s.course || 'Unknown';
      if (!courseMap[course]) courseMap[course] = { course, students: 0, collected: 0, total: 0 };
      courseMap[course].students++;
      courseMap[course].collected += s.paidFees || 0;
      courseMap[course].total += s.totalFees || 0;
    });

    const courseBreakdown = Object.values(courseMap).map(c => ({
      ...c,
      percent: c.total > 0 ? Math.round((c.collected / c.total) * 100) : 0,
      pending: c.total - c.collected
    }));

    res.json({
      totalStudents, fullyPaid, partial, overdue,
      totalFees, totalCollected, totalPending, collectionRate,
      monthlyData, courseBreakdown, recentTransactions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};