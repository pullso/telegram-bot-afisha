const ADMIN_CHAT_ID = -558602679

export default async function (ctx, next) {
  const {first_name, id} = ctx.from
  const message = `${id}:${first_name} - ${ctx.message?.text || ctx?.update.callback_query?.data}`
  console.log(message)
  await ctx.telegram.sendMessage(ADMIN_CHAT_ID, message)
  return next()
}
