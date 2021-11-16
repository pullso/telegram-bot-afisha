import _ from "lodash";

export default function (ctx, next) {
  const messages = _.get(ctx,'session.deleteMessageIds', [])
  if (messages.length) {
    _.each(messages, (async (m, index) => {
      try {
        await ctx.telegram.deleteMessage(m.chat_id, m.message_id)
        delete ctx.session.deleteMessageIds[index]
      } catch (e) {
        console.log(e)
      }
    }))
  }

  return next()
}
