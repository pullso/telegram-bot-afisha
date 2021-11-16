import _ from "lodash";

export default function (ctx, next) {
  const messages = _.get(ctx,'session.deleteMessageIds', [])
  if (messages.length) {
    _.each(messages, (async ({chat_id, message_id}, index) => {
      try {
        await ctx.telegram.deleteMessage(chat_id, message_id)
        _.remove(messages, {message_id})
      } catch (e) {
        console.log(e)
      }
    }))
  }

  return next()
}
