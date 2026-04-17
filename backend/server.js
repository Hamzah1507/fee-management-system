const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const Papa = require("papaparse");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Multer setup
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Import endpoint - DIRECT ON APP
app.post("/api/import", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 Import request received");
    
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 Parser started...");
    const csvData = req.file.buffer.toString();
    
    // Normalize headers (trim spaces, remove BOM)
    let cleanCsvData = csvData.trim();
    if (cleanCsvData.charCodeAt(0) === 0xFEFF) {
      cleanCsvData = cleanCsvData.slice(1);
    }

    const parseResult = Papa.parse(cleanCsvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim()
    });

    // Helper to find value by fuzzy key
    const getValue = (row, keyPart) => {
      const key = Object.keys(row).find(k => k.toLowerCase().includes(keyPart.toLowerCase()));
      return key ? row[key] : null;
    };

    const rows = parseResult.data.filter(row => {
        const name = getValue(row, 'name');
        return name && name.trim().length > 0;
    });
    console.log("✅ Parsed", rows.length, "valid rows");

    // Require model here to ensure connection is ready
    const Student = require("./models/student.model");

    const validStudents = rows.map(row => {
      const name = getValue(row, 'name');
      const email = getValue(row, 'email');
      const phone = getValue(row, 'phone');
      const course = getValue(row, 'course');
      const semester = getValue(row, 'semester') || "1";
      const totalFeesRaw = getValue(row, 'totalfees') || getValue(row, 'total') || "0";
      const paidRaw = getValue(row, 'paid') || getValue(row, 'paidfees') || "0";
      const dueDateRaw = getValue(row, 'dueDate') || getValue(row, 'date') || getValue(row, 'due');

      return {
        name: name ? name.toString().trim() : "Unknown",
        email: email ? email.toString().trim() : "",
        phone: phone ? phone.toString().trim() : "",
        course: course ? course.toString().trim() : "",
        semester: semester.toString(),
        dueDate: (function(d) {
            if (!d) return null;
            d = d.toString().trim();
            // Handle DD-MM-YYYY format
            if (d.includes('-') && d.split('-')[0].length === 2 && d.split('-')[2].length === 4) {
              const parts = d.split('-');
              return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to YYYY-MM-DD
            }
             // Handle DD/MM/YYYY
            if (d.includes('/') && d.split('/')[0].length === 2 && d.split('/')[2].length === 4) {
                const parts = d.split('/');
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
            // Standard parse
            const date = new Date(d);
            return isNaN(date.getTime()) ? null : date;
        })(dueDateRaw),
        // Fix for currency symbols or commas
        totalFees: parseFloat(totalFeesRaw.toString().replace(/[^0-9.]/g, '')) || 0,
        paidFees: parseFloat(paidRaw.toString().replace(/[^0-9.]/g, '')) || 0
      };
    });

    if (validStudents.length === 0) {
      return res.status(400).json({ error: "No valid student records found in CSV" });
    }

    console.log(`💾 Inserting ${validStudents.length} students...`);
    const result = await Student.insertMany(validStudents, { ordered: false });
    console.log("✅ Successfully inserted", result.length, "students");

    res.json({
      success: true,
      message: `✅ Successfully imported ${result.length} students!`,
      count: result.length
    });

  } catch (err) {
    console.log("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ API is working correctly" });
});

// Other routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
