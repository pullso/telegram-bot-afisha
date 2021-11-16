import dotenv from "dotenv";

dotenv.config()

import {bot} from "./src/bot.js";
import moment from "./src/plugins/moment.js";
import CronController from "./src/controllers/CronController.js";
import DbController from "./src/controllers/DbController.js";

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError('not working telegram token')
}

const PORT = process.env.PORT || 5000;
const URL = process.env.WEBHOOK_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

async function startApp() {
  const isProd = process.env.NODE_ENV === 'production'
  const time = moment().format('llll')

  try {
    if (isProd) {
      await bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`)
      await bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT)
      console.log(`bot started with webhook at ${time}`)
    } else {
      bot.launch()
        .then(() => console.log(`bot started at ${time}`))
        .catch(err => console.log(err, `: err`))
    }
  } catch (e) {
    console.log(e, `:app starting err`)
  }
}

DbController.connect()
CronController.start()
await startApp()




