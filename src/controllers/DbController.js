import mongoose from "mongoose";

class DbController {
  async connect() {
    await mongoose.connect(process.env.MONGO_URI)
      .then(
        () => console.info(`Connected to database`),
        error => {
          console.error(`Connection error: ${error.stack}`)
          process.exit(1)
        }
      )
  }
}

export default new DbController()
