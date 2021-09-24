import mongoose from "mongoose";

export const connectDb = async () => {
  await mongoose.connect(process.env.MONGO_URI).then(
    () => {
      console.info(`Connected to database`)
    },
    error => {
      console.error(`Connection error: ${error.stack}`)
      process.exit(1)
    }
  )
}
