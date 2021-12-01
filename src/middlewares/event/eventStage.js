import {Markup, Scenes, Telegraf} from "telegraf";
import {calendar, menuKeyboard} from "../../bot.js";
import EventsController from "./EventsController.js";

const {WizardScene} = Scenes
export const eventStage = new WizardScene(
  'eventStage',
  Telegraf.action(/calendar-telegram-date-(.+)/g, EventsController.getDate),
  EventsController.sendEvents,
)

eventStage.action('moreEvents',async (ctx)=> {
  await ctx.editMessageReplyMarkup(ctx.message?.chat_id)
  await EventsController.moreEvents(ctx)
})

eventStage.action(/date (.+)/g, EventsController.getDate)

eventStage.action(/calendar-telegram-next-(.+)/g, ctx => {
  let date = new Date(ctx.match[1]);
  date.setMonth(date.getMonth() + 1);
  let prevText = ctx.callbackQuery.message.text;

  ctx.editMessageText(prevText, getKeyboard(date))
})

eventStage.action('calendar', async (ctx) => {
  const today = new Date();
  const minDate = new Date();
  minDate.setMonth(today.getMonth());
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 2);
  maxDate.setDate(today.getDate());
  calendar.setMinDate(minDate).setMaxDate(maxDate)

  const {message_id} = await ctx.editMessageText(
    'Выберите дату поиска:', getKeyboard(today))
})

eventStage.action(/calendar-telegram-prev-(.+)/g, ctx => {
  let date = new Date(ctx.match[1]);
  date.setMonth(date.getMonth() - 1);
  let prevText = ctx.callbackQuery.message.text;
  ctx.editMessageText(prevText, getKeyboard(date))
})

eventStage.action(/calendar-telegram-ignore-[\d\w-]+/g, context => context.answerCbQuery());

eventStage.enter(EventsController.enter)
eventStage.action('menu', async ctx => {
  await ctx.editMessageReplyMarkup(undefined)
  await ctx.reply('📋 Меню', menuKeyboard)
  await ctx.scene.leave()
})


function getKeyboard(date) {
  const keyboard = calendar.helper.getCalendarMarkup(date)
  const menuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📋 Меню', 'menu')]
  ]).resize().reply_markup.inline_keyboard

  const inlineKeyboard = keyboard.reply_markup.inline_keyboard
  keyboard.reply_markup.inline_keyboard = [...inlineKeyboard, ...menuKeyboard]

  return keyboard
}
