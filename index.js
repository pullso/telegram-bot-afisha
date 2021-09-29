import {bot} from "./src/bot.js";
import {connectDb} from './src/connectDb.js'

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError('not working telegram token')
}

const PORT = process.env.PORT || 5000;
const URL = process.env.WEBHOOK_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

await connectDb().catch(error => console.error(error))

bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`)
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT)

// bot.launch()
//   .then(() =>
//     console.log(`bot started at ${new Date()}`))
//   .catch(err => console.log(err, `: err`))

