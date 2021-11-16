import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  tgId: Number,
  options: {
    cities: String,
    price_max: {
      type: Number,
      default: 0,
    },
    price_min: {
      type: Number,
      default: 0,
    },
  },
  created: {
    type: Date,
    default: Date.now()
  }
})

export const User = mongoose.model('User', userSchema)
