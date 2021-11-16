import {Scenes, Telegraf} from "telegraf";
import {menuKeyboard} from "../../bot.js";
import EventsController from "./EventsController.js";

const {WizardScene} = Scenes
export const eventStage = new WizardScene(
  'eventStage',
  Telegraf.action(/date (.+)/, EventsController.getDate),
  EventsController.sendEvents,
  Telegraf.action('moreEvents', EventsController.moreEvents)
)

eventStage.enter(EventsController.enter)
eventStage.action('menu', async ctx => {
  await ctx.reply('📋 Меню', menuKeyboard)
  await ctx.scene.leave()
})


