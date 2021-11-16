import {User} from "../models/User.js";
import mongoose from "mongoose";

class UserService {
  async find(id) {
    try {
      const user = await User.findOne({tgId: id})
      return user
    } catch (e) {
      console.log(e)
    }
  }

  async create(id) {
    try {
      const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        tgId: id,
        options: {}
      })
      return user
    } catch (e) {
      console.log(e)
    }
  }
}

export default new UserService()
