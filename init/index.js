const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../model/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
   const dataWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: "65f2c68997589a4ee3b3683c", 
  }));
  await Listing.insertMany(dataWithOwner);
  console.log("Data was initialized with owners");
};

initDB();

