import {Markup, Scenes, Telegraf} from "telegraf";
import {User} from "../mongoModel.js";
import {menuKeyboard} from "../bot.js";

const {WizardScene} = Scenes

const getCity = Telegraf.action(/city (.+)/, async ctx => {
  ctx.session.settings.cities = ctx.match[1]
  await ctx.editMessageText('Минимальная цена мероприятия', Markup.inlineKeyboard([
      [Markup.button.callback('Бесплатно', 'min 0'),
        Markup.button.callback('500', 'min 500')],
      [Markup.button.callback('1000', 'min 1000'),
        Markup.button.callback('1500', 'min 1500')],
      [Markup.button.callback('2000', 'min 2500'),
        Markup.button.callback('2500', 'min 2500')],
      [Markup.button.callback('📋 Меню', 'menu')]
    ]
  ).resize())
  ctx.wizard.next()
})

const getMinPrice = Telegraf.action(/min (.+)/, async ctx => {
  const min = ctx.match[1]
  ctx.session.settings.price_min = min
  await ctx.editMessageText('Максимальная цена мероприятия', Markup.inlineKeyboard([
      [Markup.button.callback('Бесплатно', 'max 0', min > 0),
        Markup.button.callback('500', 'max 500', min > 500)],
      [Markup.button.callback('1000', 'max 1000', min > 1000),
        Markup.button.callback('1500', 'max 1500', min > 1500)],
      [Markup.button.callback('2000', 'max 2000', min > 2000),
        Markup.button.callback('2500', 'max 2500', min > 2500)],
      [Markup.button.callback('📋 Меню', 'menu')]
    ]
  ).resize())
  ctx.wizard.next()
})

const getMaxPrice = Telegraf.action(/max (.+)/, async (ctx) => {
  ctx.session.settings.price_max = ctx.match[1]
  await ctx.editMessageText('Сохранить настройки?', Markup.inlineKeyboard([
      Markup.button.callback('☑️ Да', 'save'),
      Markup.button.callback('⬅️ Нет, перейти в Меню', 'menu', !Boolean(ctx?.session?.user?.options?.cities))
    ]
  ).resize())
  ctx.wizard.next()
})


const saveSettings = Telegraf.action('save', async (ctx) => {
  const user = await User.findOne({
    tgId: ctx.session.user.tgId
  })

  if (user) {
    user.options = {
      price_max: ctx.session.settings.price_max,
      price_min: ctx.session.settings.price_min,
      cities: ctx.session.settings.cities
    }
    await user.save()
    if (ctx.session.user) ctx.session.user = null
  }

  await ctx.editMessageText('🤙 Настройки цены и города сохранены\n📋 Меню', menuKeyboard)
})

export const settingsStage = new WizardScene('settings', getCity, getMinPrice, getMaxPrice, saveSettings)

settingsStage.enter(async ctx => {
  await ctx.editMessageText('Твой город:', Markup.inlineKeyboard([
      [Markup.button.callback('Москва', 'city Москва')],
      [Markup.button.callback('Санкт-Петербург', 'city Санкт-Петербург')],
      [Markup.button.callback('Екатеринбург', 'city Екатеринбург')],
      [Markup.button.callback('📋 Меню', 'menu')]
    ]
  ).resize())
})

settingsStage.action('menu', async ctx => {
  await ctx.editMessageText('📋 Меню', menuKeyboard)
  await ctx.scene.leave()
})



