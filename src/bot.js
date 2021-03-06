import {Markup, Scenes, session, Telegraf} from "telegraf";
import sessionMiddleware from './middlewares/session.js'
import {settingsStage} from "./middlewares/settings/settingsStage.js";
import {eventStage} from "./middlewares/event/eventStage.js";
import userMiddleware from "./middlewares/user.js";
import logMiddleware from "./middlewares/log.js";
import BotController from "./controllers/BotController.js";
import editMessagesMiddleware from "./middlewares/editMessages.js";
import Calendar from "telegraf-calendar-telegram";

const {BOT_TOKEN, BOT_TOKEN_DEV} = process.env

if (BOT_TOKEN === undefined && BOT_TOKEN_DEV === undefined) {
  throw new TypeError('not working telegram token')
}


export const bot = new Telegraf(process.env.NODE_ENV === 'production' ? BOT_TOKEN : BOT_TOKEN_DEV)


export const menuKeyboard = Markup
  .inlineKeyboard([
    [Markup.button.callback('🔍 Поиск мероприятий', 'events'),
      Markup.button.callback('⚙ ️Настройки', 'settings')],
    [Markup.button.url('📢 Поделиться ботом', 'https://t.me/share/url?url=https%3A//t.me/afishatimepadbot?start=share')],
// ['🔍 Поиск мероприятий', '😎 Подписка'],
// ['⚙ ️Настройки', '📞 Обратная связь'],
// ['👥 Поделиться ботом']
  ])
  .oneTime()
  .resize()


bot.start(BotController.start)

const stage = new Scenes.Stage([settingsStage, eventStage])

bot.use(
  // Telegraf.log(),
  session(),
  sessionMiddleware,
  userMiddleware,
  editMessagesMiddleware,
  logMiddleware,
  stage.middleware(),
)

export const calendar = new Calendar(bot, {
  startWeekDay: 1,
  weekDayNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  monthNames: [
    "Янв", "Фев", "Март", "Апр", "Май", "Июнь",
    "Июль", "Авг", "Сен", "Окт", "Ноя", "Дек"
  ],
});


bot.action('settings', ctx => ctx.scene.enter('settings'))
bot.action('events', ctx => ctx.scene.enter('eventStage'))
bot.help((ctx) => ctx.reply('Бот создан для помощи в поиске ивентов.\nЕсли кнопки не работают - попробуйте написать боту любой текст. Если вы нашли какие-то проблемы или ошибки - сообщите, пожалуйста, мне.\nНапишите @pullso.', menuKeyboard)
)
bot.action('menu',(ctx) => ctx.reply('📋 Меню', menuKeyboard))
bot.action('moreEvents',(ctx) => ctx.reply('📋 Меню', menuKeyboard))
bot.on('text',(ctx) => ctx.reply('📋 Меню', menuKeyboard))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
