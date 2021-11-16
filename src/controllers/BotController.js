import {Markup} from "telegraf";

class BotController {
  start(ctx) {
    const keyboard = Markup
      .inlineKeyboard([
        Markup.button.callback('⚙ Настроить поиск', 'settings')
      ]).oneTime().resize()

    ctx.reply(`Привет, ${ctx?.message?.chat?.first_name}.\nМеня зовут Павел)\nЯ создал этого бота, чтобы помочь тебе быстрее находить интересные ивенты❤️\nЕсли будут идеи по улучшению бота - пиши @pullso`, keyboard)
  }
}

export default new BotController()
