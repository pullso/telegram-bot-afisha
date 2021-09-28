import {Markup, Scenes, Telegraf} from "telegraf";
import {getEvents} from "../api.js";
import moment from "moment";
import {menuKeyboard} from "../bot.js";

const {WizardScene} = Scenes

let eventLimit = 5

function getFormattedDates(text) {
  const settings = {}
  if (text === 'Завтра') {
    settings.starts_at_min = moment().add(1, 'days').startOf('day').format()
    settings.starts_at_max = moment().endOf('day').add(1, 'days').format()
  } else if (text === 'Выходные') {
    settings.starts_at_min = moment().day(6).startOf('day').format()
    settings.starts_at_max = moment().day(7).endOf('day').format()
  } else {
    settings.starts_at_max = moment().endOf('day').format()
  }

  return settings
}

async function resWithEvents(ctx) {
  const count = ctx.session.events.length >= eventLimit ? eventLimit : ctx.session.events.length
  const events = ctx.session.events.splice(0, count).map(el => `${el.name}\n${moment(el.starts_at).format('llll')}\n${el.url}`)

  await ctx.replyWithHTML(events.join('\n\n'), Markup.inlineKeyboard([
    Markup.button.callback('Ещё', 'moreEvents'),
    Markup.button.callback('📋 Меню', 'menu')
  ]))
}

const getDate = Telegraf.action(/date (.+)/, async ctx => {
  ctx.session.settings.date = ctx.match[1]

  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('Найти мероприятие', 'sendEvents'),
    Markup.button.callback('📋 Меню', 'menu')
  ]).resize()

  const opt = {
    ...ctx.session.settings,
    ...ctx.session.user.options,
  }

  const {price_max, price_min} = opt
  const priceText = (price_max === price_min && price_min === 0)
    ? 'Бесплатно'
    : `от ${price_min} до ${price_max}`

  await ctx.editMessageText(`🔍 Настройки поиска:\n📍 ${opt.cities}\n💸 ${priceText} \n⏱ ${opt.date}`, keyboard)
  ctx.wizard.next()
})

const sendEvents = Telegraf.action('sendEvents', async ctx => {
  const options = {
    ...ctx.session.settings,
    ...ctx.session.user.options,
    ...getFormattedDates(ctx.session.settings.date)
  }

  delete options.date
  const data = await getEvents(options)

  if (data && data.data && data.data.values && data.data.values.length) {
    ctx.session.events = data.data.values
    await ctx.reply(`Всего мероприятий: ${ctx.session.events.length}`)
    await resWithEvents(ctx)
  } else {
    await ctx.reply('Что-то пошло не так...')
  }

  await ctx.wizard.next()
})

const moreEvents = Telegraf.action('moreEvents', async ctx => {
  if (ctx.session.events.length === 0) {
    await ctx.reply('Больше мероприятий нет\n📋 Меню', menuKeyboard)
  } else {
    await resWithEvents(ctx)
  }
})


export const eventStage = new WizardScene('eventStage', getDate, sendEvents, moreEvents)

eventStage.enter(async ctx => {
  await ctx.editMessageText('Выберите дату поиска:', Markup.inlineKeyboard([
    [Markup.button.callback('Сегодня', 'date Сегодня'), Markup.button.callback('Завтра', 'date Завтра')],
    [Markup.button.callback('Выходные', 'date Выходные')],
    [Markup.button.callback('📋 Меню', 'menu')]
  ]).resize())
})

eventStage.action('menu', async ctx => {
  await ctx.reply('📋 Меню', menuKeyboard)
  await ctx.scene.leave()
})


