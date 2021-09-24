export default function (ctx, next) {
  if (!ctx.session) ctx.session = {
    settings: {},
    events: [],
    eventsCount: 0,
  }

  return next()
}

