const express = require("express");
const app = express();
const ejs = require("ejs");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // 處理get,post,... request 取得 req.body
const Serie = require("./models/serie");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const keyList = require("./series.json");
// const cors = require("cors");
// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

//MerkleProof function
function MerkleProof(series) {
  const leafNodes = keyList.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });
  const claimingSeries = keccak256(series);
  const hexProof = merkleTree.getHexProof(claimingSeries);
  return hexProof;
}

//Middleware
// app.use(cors(corsOptions));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // 處理get,post,... request 取得 req.body

// mongoose.set("useFindAndModify", false);

//connect mongodb atlas (use mongoose).
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect to mongodb atlas.");
  })
  .catch((err) => {
    console.log(err);
  });

app.post("/:serie", (req, res) => {
  let hashSerie = keccak256(req.params.serie).toString("hex");
  Serie.findOne({ serie: hashSerie })
    .then((data) => {
      if (data !== null) {
        merkleProof = MerkleProof(req.params.serie);
        res.send(merkleProof);
      } else {
        res.send("Your serie not correct!");
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

//route
app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed.");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000.");
});
