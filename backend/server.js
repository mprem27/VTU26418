require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const sequelize = require("./config/db");
const Record = require("./models/Record");

const app = express();

app.use(cors());
app.use(express.json());

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Home Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// Add Single Record
app.post("/api/add-record", async (req, res) => {
  try {
    const record = await Record.create(req.body);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get All Records
app.get("/api/records", async (req, res) => {
  try {
    const records = await Record.findAll();

    res.json(records);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Pagination API
app.get("/api/records/page", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 100;

    const offset = (page - 1) * limit;

    const { count, rows } = await Record.findAndCountAll({
      limit,
      offset,
    });

    res.json({
      success: true,
      page,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

// CSV Upload API
app.post(
  "/api/upload-csv",
  upload.single("file"),
  async (req, res) => {

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {

        if (data.name && data.email) {

          results.push({
            name: data.name.trim(),
            email: data.email.trim(),
          });

        }

      })
      .on("end", async () => {

        await Record.bulkCreate(results);

        res.json({
          success: true,
          inserted: results.length,
        });

      });

  }
);

// Start Server
sequelize
  .sync({ alter: true })
  .then(() => {

    console.log("Database Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });

  })
  .catch((err) => {
    console.log(err);
  });