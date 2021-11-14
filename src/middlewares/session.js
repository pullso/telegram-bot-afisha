export default function (ctx, next) {
  if (!ctx.session) ctx.session = {
    settings: {},
    events: [],
    eventsCount: 0,
    deleteMessageIds: [],
    page: {
      pageIndex: 1,
      pageSize: 10
    }
  }

  if (ctx.session?.deleteMessageIds?.length) {
    ctx.session.deleteMessageIds
      .forEach(async ({chat_id, message_id},index) => {
        await ctx.telegram.deleteMessage(chat_id, message_id)
        delete ctx.session.deleteMessageIds[index]
      })
  }

  return next()
}

