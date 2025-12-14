require("dotenv").config();
const mongoose = require("mongoose");

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log("MongoDB Atlas bağlantısı başarılı:", dbURI);
  })
  .catch((err) => {
    console.log("MongoDB bağlantı hatası:", err);
  });

require("./venue");
