import {User} from "../mongoModel.js";
import mongoose from "mongoose";

export default async (ctx, next) => {
  if (!ctx.session.user || !ctx.session.user.options.cities) {
    const user = await User.findOne({
      tgId: ctx.from.id
    })

    if (!user) {
      await User.create({
        _id: new mongoose.Types.ObjectId(),
        tgId: ctx.message.from.id,
        options: {}
      })
    }

    ctx.session.user = user
  }

  return next()
}
