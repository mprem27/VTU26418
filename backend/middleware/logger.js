const axios = require("axios");

async function logEvent(logData) {
  try {
    const response = await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      logData,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2dHUyNjQxOEB2ZWx0ZWNoLmVkdS5pbiIsImV4cCI6MTc4MTY4MDY5MiwiaWF0IjoxNzgxNjc5NzkyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMmY2NWVjN2EtZTY1ZC00MzhmLWJlMTMtMWViMzQxZWZlZjM3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWFsZXBhdGkgcHJlbSBrdW1hciByZWRkeSIsInN1YiI6ImQzZDJlM2I2LTUzMjMtNGFiYi1iYWFlLTcxZjExZTY2ZTc1OSJ9LCJlbWFpbCI6InZ0dTI2NDE4QHZlbHRlY2guZWR1LmluIiwibmFtZSI6Im1hbGVwYXRpIHByZW0ga3VtYXIgcmVkZHkiLCJyb2xsTm8iOiJ2dHUyNjQxOCIsImFjY2Vzc0NvZGUiOiJqdUZwaHYiLCJjbGllbnRJRCI6ImQzZDJlM2I2LTUzMjMtNGFiYi1iYWFlLTcxZjExZTY2ZTc1OSIsImNsaWVudFNlY3JldCI6IlFZblZnRVpRUGdjVmdqR3UifQ.ptQO1vwzGDaZ02V6K3m4TwkaEsBX8DR5UJ8net8ruMk`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Log Success:", response.data);
  } catch (error) {
    console.error(
      "Log Error:",
      error.response?.data || error.message
    );
  }
}

module.exports = logEvent;