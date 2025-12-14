require("dotenv").config();

const mongoose = require("mongoose");

const dbURI = process.env.MONGODB_URI || "mongodb://localhost/mekanbul";

mongoose.connect(dbURI);

mongoose.connection.on("connected", function () {
  console.log("MongoDB bağlantısı başarılı:", dbURI);
});
mongoose.connection.on("error", function (err) {
  console.log("MongoDB bağlantı hatası:", err);
});
mongoose.connection.on("disconnected", function () {
  console.log("MongoDB bağlantısı kesildi.");
});

process.on("SIGINT", function () {
  mongoose.connection.close();
  console.log("MongoDB uygulama sonlandırma nedeniyle bağlantıyı kapattı.");
  process.exit(0);
});

require("./venue");


