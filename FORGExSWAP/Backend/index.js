import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { Blob } from "buffer";
import FormData from 'form-data'
import fs from "fs";
import path from "path";
import { PinataSDK } from "pinata";
import { tokenData } from "./modals/tokenDataSchema.js"; // ensure .js or .ts based on your project


let conn = await mongoose.connect("mongodb://localhost:27017/TokenData");
const app = express();
const port = 3002;
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
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
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNDUxMTdmZi1iYTI4LTQxODQtOTUxYi1kYmFkZGEwNGZhNDgiLCJlbWFpbCI6InN1cmFqYmhvajAxMDFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjEwMWY0ZDZmZTVmN2NjZDI4MTE2Iiwic2NvcGVkS2V5U2VjcmV0IjoiODkwYTE2YmViMWU3NDhlZTJkODM4YjdjMmJiYjNmNzNlNGViOThlMGYzMjMzOWEzNWQ5YmExN2Q2OWQxNmUzNSIsImV4cCI6MTc4MjQ3MjY5OH0.m41Djro-3im8CljhEs_uJRWgZ7NfPLXLRt65rjMqEBg",
  pinataGateway: "scarlet-naval-lizard-255.mypinata.cloud"
});


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);

    // Create a Node.js file-like object for Pinata SDK
    const fileBuffer = fs.readFileSync(filePath);
    const file = new File([fileBuffer], req.file.originalname, { type: req.file.mimetype });

    // Upload using Pinata v2 SDK
    const result = await pinata.upload.public.file(file);

    // Delete the file locally
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


app.listen(port, () => {
  console.log(`My App  on port ${port}`)
});
