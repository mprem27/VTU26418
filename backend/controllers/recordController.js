
const fs = require("fs");
const csv = require("csv-parser");
const Record = require("../models/Record");

exports.addRecord = async (req, res) => {
  try {
    const record = await Record.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllRecords = async (req, res) => {
  try {
    const records = await Record.findAll();
    res.json(records);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getPaginatedRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Record.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      page,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

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
      try {
        await Record.bulkCreate(results, { ignoreDuplicates: true });
        fs.unlinkSync(req.file.path); 
        
        res.json({ success: true, inserted: results.length });
      } catch (error) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: "DB insertion failed", error: error.message });
      }
    });
};