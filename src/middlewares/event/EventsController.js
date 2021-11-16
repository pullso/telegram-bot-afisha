import {Markup} from "telegraf";
import {menuKeyboard} from "../../bot.js";
import EventsService from "./EventsService.js";

class EventsController {
  async enter(ctx) {
    const {message_id} = await ctx.editMessageText(
      'Выберите дату поиска:',
      Markup.inlineKeyboard([
        [Markup.button.callback('Сегодня', 'date Сегодня'),
          Markup.button.callback('Завтра', 'date Завтра')],
        [Markup.button.callback('Выходные', 'date Выходные')],
        [Markup.button.callback('📋 Меню', 'menu')]
      ]).resize())

    ctx.session.deleteMessageIds.push({message_id, chat_id: ctx.chat.id})
  }

  async moreEvents(ctx) {
    if (ctx.session?.events?.length === 0) {
      await ctx.reply('Больше мероприятий нет\n📋 Меню', menuKeyboard)
    } else {
      const data = await EventsService.getEventsResponse(ctx)
      await sendEventResponse(ctx, data);
    }
  }

  async sendEvents(ctx) {
    ctx.session.events = []
    const events = await EventsService.getEvents(ctx)

    if (events?.values?.length) {
      ctx.session.events = EventsService.prepareEvents(events)
      const eventsData = await EventsService.getEventsResponse(ctx)
      await sendEventResponse(ctx, eventsData);
      await ctx.wizard.next()
    } else {
      ctx.session.settings = {}
      await ctx.reply('Мероприятия не найдены...', menuKeyboard)
      await ctx.scene.leave()
    }
  }

  async getDate(ctx) {
    ctx.session.settings.date = ctx.match[1]

    const opt = {
      ...ctx.session.settings,
      ...ctx.session.user.options,
    }

    const {price_max, price_min} = opt
    const priceText = (price_max === price_min && price_min === 0)
      ? 'Бесплатно'
      : `от ${price_min} до ${price_max}`

    const {message_id} = await ctx.reply(`🔍 Настройки поиска:\n📍 ${opt.cities}\n💸 ${priceText} \n⏱ ${opt.date}`)

    ctx.session.deleteMessageIds.push({message_id, chat_id: ctx.chat.id})
    return ctx.wizard.steps[ctx.wizard.cursor + 1](ctx);
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
