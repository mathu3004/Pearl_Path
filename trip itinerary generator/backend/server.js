require("dotenv").config();
const connectDatabase = require("./config/db");
const app = require("./app");
const PORT = process.env.PORT || 5001;

connectDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
