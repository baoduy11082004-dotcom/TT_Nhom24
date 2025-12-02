const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend (port 3000) gọi sang
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

// Route test để biết server đang chạy
app.get("/", (req, res) => {
  res.send("API Backend đang chạy với MySQL...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));
