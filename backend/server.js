require("dotenv").config();
const express = require("express");
const cors = require("cors");


const sequelize = require("./config/db");


const affordmedLogger = require("./middleware/logger");


const recordRoutes = require("./routes/recordRoutes");

const app = express();


app.use(cors());
app.use(express.json());


app.use(affordmedLogger);

app.get("/", (req, res) => {
  res.send("Server Running with Clean Architecture!");
});


app.use("/api", recordRoutes);

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });