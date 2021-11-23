import UserService from "../services/UserService.js";

export default async (ctx, next) => {
  if (!ctx?.session?.user || !ctx?.session?.user?.options?.cities) {
    const id = ctx?.from?.id
    const user = await UserService.find(id)
    if (!user) await UserService.create(id)
    ctx.session[ctx.from.id].user = user
  }

  return next()
}
