import {Markup, Scenes, Telegraf} from "telegraf";
import {getEvents} from "../api.js";
import moment from '../moment.js'
import {menuKeyboard} from "../bot.js";
import {getFormattedDates, paginate} from "../utils.js";
import _ from "lodash";

const {WizardScene} = Scenes


function prepareEvents(data) {
  const {values} = data
  const events = _.groupBy(values, 'name')
  _.each(events, groupEvent => {
    if (groupEvent.length > 1) {
      const name = groupEvent[0].name

      const result = {
        name,
        id: _.map(groupEvent, e => e.id),
        starts_at: _.map(groupEvent, e => e.starts_at),
        url: _.map(groupEvent, e => e.url)
      }

      events[name] = [result]
    }
  })

  return _.values(events).map(el => el[0])
}

async function getEventsResponse(ctx) {
  const session = ctx.session
  const {pageIndex, pageSize} = ctx.session?.page
  if (!session.events) return {}

  const sessionEvents = [...session?.events]

  const events = paginate(
    sessionEvents,
    session.page
  )

  // TODO remove console
  console.log(events.length, `: events.length`)
  if (!events.length) return null

  const isLastPage = Math.ceil(sessionEvents.length / pageSize) === pageIndex
  session.page.pageIndex = isLastPage ? 1 : pageIndex + 1;
  const prevValue = session.page.pageIndex
  setTimeout(() => {
    if (prevValue === session.page.pageIndex) session.page.pageIndex = 1
  }, 1 * 60 * 1000)

  const date = _.isArray(events[0]?.starts_at)
    ? events[0]?.starts_at[0]
    : events[0]?.starts_at

  const title = `<b>Афиша на ${moment(date).format('L')}</b> от @afishatimepadbot`

  const response = [
    title,
    ...events
      .map(event => {
        const time = _.isArray(event.starts_at)
          ? _.map(event.starts_at, t => moment(t).format('HH:mm')).join(', ')
          : moment(event.starts_at).format('HH:mm')

        const name = event.name.replace(/&amp;quot;/g, '"')

        const url = `<a href="${_.isArray(event.url)
          ? event.url[0] : event.url}">${name}</a>`

        return [time, url].join(' ')
      }),
  ]

  if (isLastPage) response.push('На этот день больше мероприятий нет👨‍💻\nНу вот и все, ребята🤷‍♂️')

  return {response, isLastPage}
}

async function sendEventResponse(ctx, {response = null, isLastPage = false}) {
  if (!response || !response.length) {
    await ctx.reply('Что-то пошло не так с мероприятиями...', menuKeyboard)
    return
  }

  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('Ещё', 'moreEvents', isLastPage),
    Markup.button.callback('📋 Меню', 'menu')
  ])

  await ctx.replyWithHTML(
    response.join('\n\n'),
    {
      disable_web_page_preview: true,
      parse_mode: "HTML",
      reply_markup: keyboard.reply_markup
    },
  )
}

const getDate = Telegraf.action(/date (.+)/, async ctx => {
  ctx.session.settings.date = ctx.match[1]

  const opt = {
    ...ctx.session.settings,
    ...ctx.session.user.options,
  }

  const {price_max, price_min} = opt
  const priceText = (price_max === price_min && price_min === 0)
    ? 'Бесплатно'
    : `от ${price_min} до ${price_max}`

  await ctx.reply(`🔍 Настройки поиска:\n📍 ${opt.cities}\n💸 ${priceText} \n⏱ ${opt.date}`)
  return ctx.wizard.steps[ctx.wizard.cursor + 1](ctx);
})

const sendEvents = async ctx => {
  const options = {
    ...ctx?.session?.settings,
    ...ctx?.session?.user?.options,
    ...getFormattedDates(ctx?.session?.settings?.date)
  }

  delete options.date
  ctx.session.events = []
  const {data} = await getEvents(options)

  if (data?.values?.length) {

    ctx.session.events = prepareEvents(data)

    const eventsData = await getEventsResponse(ctx)

    await sendEventResponse(ctx, eventsData);
  } else {
    await ctx.reply('Мероприятия не найдены...', menuKeyboard)
  }
  await ctx.wizard.next()
}

const moreEvents = Telegraf.action('moreEvents', async ctx => {
  if (ctx.session.events.length === 0) {
    await ctx.reply('Больше мероприятий нет\n📋 Меню', menuKeyboard)
  } else {
    const data = await getEventsResponse(ctx)
    await sendEventResponse(ctx, data);
  }
})

export const eventStage = new WizardScene(
  'eventStage',
  getDate,
  sendEvents,
  moreEvents
)

eventStage.enter(async ctx => {
  const {message_id} = await ctx.editMessageText(
    'Выберите дату поиска:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Сегодня', 'date Сегодня'), Markup.button.callback('Завтра', 'date Завтра')],
      [Markup.button.callback('Выходные', 'date Выходные')],
      [Markup.button.callback('📋 Меню', 'menu')]
    ]).resize())

  ctx.session.deleteMessageIds.push({message_id, chat_id: ctx.chat.id})
})

eventStage.action('menu', async ctx => {
  await ctx.reply('📋 Меню', menuKeyboard)
  await ctx.scene.leave()
})


