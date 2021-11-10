import {bot} from "./src/bot.js";
import {connectDb} from './src/connectDb.js'
import moment from "./src/moment.js";

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError('not working telegram token')
}

const PORT = process.env.PORT || 5000;
const URL = process.env.WEBHOOK_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

await connectDb().catch(error => console.error(error))
const time = moment().format()

if (process.env.NODE_ENV === 'production') {
  await bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`)
  await bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT)
  console.log(`bot started with webhook at ${time}`)
} else {
  bot.launch()
    .then(() => console.log(`bot started at ${time}`))
    .catch(err => console.log(err, `: err`))
}



