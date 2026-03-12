const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
