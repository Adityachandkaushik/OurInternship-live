import mongoose from "mongoose";

const OfferTemplateSchema = new mongoose.Schema({
  content: String,
  updatedAt: Date,
});
  
export default mongoose.model("OfferTemplate", OfferTemplateSchema);
