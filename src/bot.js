import {Telegraf, session, Markup, Scenes} from "telegraf";
import sessionMiddleware from './middlewares/session.js'
import {settingsStage} from "./middlewares/settings/settingsStage.js";
import {eventStage} from "./middlewares/event/eventStage.js";
import userMiddleware from "./middlewares/user.js";
import logMiddleware from "./middlewares/log.js";
import BotController from "./controllers/BotController.js";
import editMessagesMiddleware from "./middlewares/editMessages.js";

const {BOT_TOKEN, BOT_TOKEN_DEV} = process.env

if (BOT_TOKEN === undefined && BOT_TOKEN_DEV === undefined) {
  throw new TypeError('not working telegram token')
}


export const bot = new Telegraf(process.env.NODE_ENV === 'production' ? BOT_TOKEN : BOT_TOKEN_DEV)

export const menuKeyboard = Markup
  .inlineKeyboard([
    Markup.button.callback('🔍 Поиск мероприятий', 'events'),
    Markup.button.callback('⚙ ️Настройки', 'settings')

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

bot.action('settings', ctx => ctx.scene.enter('settings'))
bot.action('events', ctx => ctx.scene.enter('eventStage'))


bot.on('text', async (ctx) => {
  return await ctx.reply('📋 Меню', menuKeyboard)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
