const initSession = {
  settings: {},
  events: [],
  eventsCount: 0,
  deleteMessageIds: [],
  page: {
    pageIndex: 1,
    pageSize: 10
  }
}

export default function (ctx, next) {
  if (!ctx.session) ctx.session = {[ctx.from.id]: initSession}
  return next()
}

