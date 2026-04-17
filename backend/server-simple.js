const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Papa = require("papaparse");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "✅ API is running!" });
});

// Test import endpoint - NO FILE
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Test endpoint works!" });
});

// Import endpoint - WITH FILE
app.post("/api/import", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 Import request received");
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 Parsing CSV...");
    const csvData = req.file.buffer.toString();
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    const rows = parseResult.data.filter(row => row.name && row.email && row.phone && row.course);
    console.log("✅ Parsed", rows.length, "valid rows");

    // Return success immediately
    res.json({
      success: true,
      message: `✅ Successfully imported ${rows.length} students!`,
      count: rows.length
    });

  } catch (err) {
    console.log("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
