import {Telegraf, session, Markup, Scenes} from "telegraf";
import dotenv from "dotenv";
import sessionMiddleware from './middlewares/session.js'
import {settingsStage} from "./middlewares/settingsStage.js";
import {eventStage} from "./middlewares/eventStage.js";
import userMiddleware from "./middlewares/user.js";
import logMiddleware from "./middlewares/log.js";

dotenv.config()
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


bot.start((ctx) =>
  ctx.reply(`Привет, ${ctx.message.chat.first_name}.\nМеня зовут Павел)\nЯ создал этого бота, чтобы помочь тебе быстрее находить интересные ивенты🖤\nЕсли будут идеи по улучшению бота - пиши @pullso`, Markup
    .inlineKeyboard([
      Markup.button.callback('⚙ Настроить поиск', 'settings')
    ])
    .oneTime()
    .resize()))

const stage = new Scenes.Stage([settingsStage, eventStage])

bot.use(
  // Telegraf.log(),
  session(),
  sessionMiddleware,
  userMiddleware,
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
