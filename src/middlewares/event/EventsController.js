import {Markup} from "telegraf";
import {calendar, menuKeyboard} from "../../bot.js";
import EventsService from "./EventsService.js";
import UserService from "../../services/UserService.js";
import moment from "../../plugins/moment.js";

class EventsController {
  async enter(ctx) {
    const {message_id} = await ctx.editMessageText(
      'Выберите дату поиска:',
      Markup.inlineKeyboard([
        [Markup.button.callback('▫️Сегодня', 'date Сегодня'),
          Markup.button.callback('▫️Завтра', 'date Завтра')],
        [Markup.button.callback('▪️Сегодня (вечер)', 'date Сегодня (17:00 - 00:00)', moment().hour() >= 17),
          Markup.button.callback('▪️Завтра (вечер)', 'date Завтра (17:00 - 00:00)')],
        [Markup.button.callback('▫сб', 'date Суббота'),
          Markup.button.callback('▫вс', 'date Воскресенье'),
          // Markup.button.callback('▫️Выходные', 'date Выходные')
        ],
        [Markup.button.callback('▫Календарь', 'calendar'),
          Markup.button.callback('📋 Меню', 'menu')]]).resize())


    ctx.session[ctx.from.id].page.pageIndex = 1;
    ctx.session[ctx.from.id].deleteMessageIds.push({message_id, chat_id: ctx.chat.id})
  }

  async moreEvents(ctx) {
    if (ctx.session[ctx.from.id].events?.length === 0) {
      await ctx.reply('Больше мероприятий нет\n📋 Меню', menuKeyboard)
    } else {
      const data = await EventsService.getEventsResponse(ctx)
      await sendEventResponse(ctx, data);
    }
  }

  async sendEvents(ctx) {
    ctx.session[ctx.from.id].events = []
    const events = await EventsService.getEvents(ctx)

    if (events?.values?.length) {
      ctx.session[ctx.from.id].events = EventsService.prepareEvents(events)
      const eventsData = await EventsService.getEventsResponse(ctx)
      await sendEventResponse(ctx, eventsData);
      await ctx.wizard.next()
    } else {
      ctx.session[ctx.from.id].settings = {}
      await ctx.reply('Мероприятия не найдены...', menuKeyboard)
      await ctx.scene.leave()
    }
  }

  async getDate(ctx) {
    const session = ctx.session[ctx.from.id]
    session.settings.date = ctx.match[1]

    const user = await UserService.find(ctx.from.id)

    const opt = {
      ...session.settings,
      ...user.options,
    }

    const {price_max, price_min} = opt
    const priceText = (price_max === price_min && price_min === 0)
      ? 'Бесплатно'
      : `от ${price_min} до ${price_max}`

    await ctx.editMessageText(`🔍 Настройки поиска:\n📍 ${opt.cities}\n💸 ${priceText} \n⏱ ${opt.date}`)
    await ctx.telegram.sendMessage(process.env.ADMIN_CHAT_ID, `${ctx.from.id}\n🔍 Настройки поиска:\n📍 ${opt.cities}\n💸 ${priceText} \n⏱ ${opt.date}`)

    return ctx.wizard.steps[ctx.wizard.cursor + 1](ctx)
  }
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

export default new EventsController()
