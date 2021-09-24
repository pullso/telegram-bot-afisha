import {getEvents} from "./api.js";
import moment from 'moment';
import {Telegraf, session, Markup, Scenes} from "telegraf";
import dotenv from "dotenv";
import sessionMiddleware from './middlewares/session.js'
import {settingsStage} from "./middlewares/settingsStage.js";
import {eventStage} from "./middlewares/eventStage.js";
import userMiddleware from "./middlewares/user.js";

dotenv.config()
moment.locale('ru')

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError('not working telegram token')
}

export const bot = new Telegraf(process.env.BOT_TOKEN)

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
  ctx.reply(`Привет, ${ctx.message.chat.first_name}.\nМеня зовут Павел)\nЯ создал этого бота, чтобы ты быстрее находил интересные ивенты\nЕсли будут идеи по улучшению бота - пиши @pullso`, menuKeyboard))

const stage = new Scenes.Stage([settingsStage, eventStage])


// bot.on('callback_query', async (ctx, next) => {
//   await ctx.reply('cxt' + ctx.callbackQuery.data)
//   return next()
// })

bot.use(
  // Telegraf.log(),
  session(),
  sessionMiddleware,
  userMiddleware,
  stage.middleware(),
)

bot.action('settings', ctx => ctx.scene.enter('settings'))
bot.action('events', ctx => ctx.scene.enter('eventStage'))



bot.on('text', async (ctx) => {
  return await ctx.reply('📋 Меню', menuKeyboard)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
