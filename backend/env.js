const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, "..", ".env");
const hasEnvFile = fs.existsSync(envPath);

if (hasEnvFile) {
  require("dotenv").config({ path: envPath });
  console.log(`Loaded environment from .env`);
} else {
  console.log(`Using platform-provided environment variables`);
}