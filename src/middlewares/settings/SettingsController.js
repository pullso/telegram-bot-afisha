import {Markup} from "telegraf";
import UserService from "../../services/UserService.js";

class SettingsController {
  async enter(ctx) {
    await ctx.editMessageText('Твой город:', Markup.inlineKeyboard([
        [Markup.button.callback('Москва', 'city Москва')],
        [Markup.button.callback('Санкт-Петербург', 'city Санкт-Петербург')],
        [Markup.button.callback('Екатеринбург', 'city Екатеринбург')],
        [Markup.button.callback('Онлайн', 'city Без города')],
        [Markup.button.callback('📋 Меню', 'menu')]
      ]
    ).resize())
  }

  async save(ctx) {
    const user = await UserService.find(ctx.from.id)

    if (user) {
      const {price_max, price_min, cities} = ctx.session.settings
      user.options = {price_max, price_min, cities}

      await user.save()
      await ctx.telegram.sendMessage(process.env.ADMIN_CHAT_ID, ctx.from.id + ' ' + user)
      ctx.session.user = null
    }

    await ctx.scene.enter('eventStage')
  }

  async getMaxPrice(ctx) {
    ctx.session.settings.price_max = ctx.match[1]
    await ctx.editMessageText('Сохранить настройки?', Markup.inlineKeyboard([
        Markup.button.callback('☑️ Да', 'save'),
        Markup.button.callback('⬅️ Нет, перейти в Меню', 'menu', !Boolean(ctx?.session?.user?.options?.cities))
      ]
    ).resize())
    ctx.wizard.next()
  }


  async getCity(ctx) {
    ctx.session.settings.cities = ctx.match[1]
    await ctx.editMessageText('Минимальная цена мероприятия',
      Markup.inlineKeyboard([
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
  }

  async getMinPrice(ctx) {
    const min = ctx.match[1]
    ctx.session.settings.price_min = min
    await ctx.editMessageText('Максимальная цена мероприятия',
      Markup.inlineKeyboard([
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
  }

}

export default new SettingsController()
