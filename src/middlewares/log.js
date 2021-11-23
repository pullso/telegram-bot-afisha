export default async function (ctx, next) {
  const {first_name, username, id} = ctx.from
  const message = `${id}:${first_name} @${username} - ${ctx.message?.text || ctx?.update.callback_query?.data}`
  console.log(message)
  await ctx.telegram.sendMessage(process.env.ADMIN_CHAT_ID, message)
  await ctx.telegram.sendMessage(process.env.ADMIN_CHAT_ID, ctx.session)
  return next()
}
