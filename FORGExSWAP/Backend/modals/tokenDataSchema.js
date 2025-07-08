import mongoose from "mongoose";

const tokenDataSchema = new mongoose.Schema({
    pairName: { type: String, required: true },
    pairAddress: { type: String, required: true },
    customTokenName: { type: String, required: true },
    secondaryTokenName: { type: String },
    customToken: { type: String, required: true },
    secondaryTokenAddress: { type: String, required: true },
    customTokenTotalSupply: { type: Number, required: true },
    secondaryTokenTotalSupply: { type: Number, default: 10000 },
    customTokenForLiquidity: { type: Number, required: true },
    secondaryTokenSupplyForLiquidity: { type: Number, required: true },
    customTokenImage: { type: String },
});


export const tokenData = mongoose.model("tokenData", tokenDataSchema);
