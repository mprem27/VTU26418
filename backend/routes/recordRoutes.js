
const express = require("express");
const router = express.Router();

const {
    addRecord,
    getAllRecords,
    getPaginatedRecords,
    uploadCSV
} = require("../controllers/recordController");

const upload = require("../middleware/upload");


router.post("/add-record", addRecord);
router.get("/records", getAllRecords);
router.get("/records/page", getPaginatedRecords);
router.post("/upload-csv", upload.single("file"), uploadCSV);

module.exports = router;