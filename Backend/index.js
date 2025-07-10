import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { Blob } from "buffer";
import FormData from 'form-data'
import fs from "fs";
import dotenv from 'dotenv'
import path from "path";
import { PinataSDK } from "pinata";
import { tokenData } from "./modals/tokenDataSchema.js"; // ensure .js or .ts based on your project

dotenv.config();
console.log(tokenData.collection.name)
const mongoUri = process.env.MONGO_URI;
let conn = await mongoose.connect(mongoUri);
console.log(conn.connection.name)
const app = express();
const port = process.env.PORT;
app.use(cors());

const storage = multer.diskStorage({ //middleware
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


app.use(express.json());
app.use(express.urlencoded({ extended: false }))

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY
});


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);//Converts the relative path (e.g. uploads/1687890-myphoto.png) into an absolute path

    // Create a Node.js file-like object for Pinata SDK
    const fileBuffer = fs.readFileSync(filePath);//fs.readFileSync reads the uploaded image into a buffer
    const file = new File([fileBuffer], req.file.originalname, { type: req.file.mimetype });//File can hold metaData of the file

    // Upload using Pinata v2 SDK
    const result = await pinata.upload.public.file(file);

    // Delete the file locally from uploads/ folder
    fs.unlinkSync(filePath);

    if (result.cid) {
      return res.status(200).json({
        success: true,
        message: "Image uploaded to IPFS successfully",
        cid: result.cid,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Pinata upload failed",
        cid: null,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during upload",
      error: error.message,
    });
  }
});


app.post("/tokenData", async (req, res) => {
  try {
    console.log(req.body)
    const Token_data = new tokenData(req.body)
    const savedToken = await Token_data.save();
    res.status(200).json({ success: true, data: savedToken });
  } catch (error) {
    console.error("Error", error)
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/fetchPair/:pairAddress', async (req, res) => {
  try {
    const { pairAddress } = req.params
    console.log(pairAddress,"add")
    const pair = await tokenData.findOne({ pairAddress })
    if (!pair) {
      return res.status(404).json({ message: "pair not found" })
    }
    res.json(pair);
  } catch (error) {
    res.status(500).json({ message: 'server error', error: error.message })
  }
})

app.get('/fetchAllToken', async (req, res) => {
  try {
    const allPairs = await tokenData.find();
    res.json(allPairs)
  } catch (error) {
    console.error("error came: ", error)
    res.status(500).json({ error: "Internal error check db" })
  }
})


app.listen(port, () => {
  console.log(`My App  on port ${port}`)
});
