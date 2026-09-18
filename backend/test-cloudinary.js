require("dotenv").config();
const cloudinary = require("./config/cloudinary");

cloudinary.uploader
  .upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
    folder: "safa-sahar/test",
  })
  .then((result) => {
    console.log("Cloudinary OK");
    console.log("URL:", result.secure_url);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Cloudinary FAILED");
    console.error(JSON.stringify(err, null, 2));
    process.exit(1);
  });