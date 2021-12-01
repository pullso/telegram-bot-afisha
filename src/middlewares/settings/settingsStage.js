import {Scenes, Telegraf} from "telegraf";
import {menuKeyboard} from "../../bot.js";
import SettingsController from "./SettingsController.js";

const {WizardScene} = Scenes

const getCity = Telegraf.action(/city (.+)/, SettingsController.getCity)
const getMinPrice = Telegraf.action(/min (.+)/, SettingsController.getMinPrice)
const getMaxPrice = Telegraf.action(/max (.+)/, SettingsController.getMaxPrice)
const saveSettings = Telegraf.action('save', SettingsController.save)

export const settingsStage = new WizardScene(
  'settings',
  getCity,
  getMinPrice,
  getMaxPrice,
  saveSettings
)

settingsStage.enter(SettingsController.enter)

settingsStage.action('menu', async ctx => {
  await ctx.editMessageReplyMarkup(undefined)
  await ctx.editMessageText('📋 Меню', menuKeyboard)
  await ctx.scene.leave()
})



