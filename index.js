import {bot} from "./src/bot.js";
import {connectDb} from './src/connectDb.js'

const PORT = process.env.PORT || 5000;
const URL = process.env.WEBHOOK_URL

connectDb().catch(error => console.error(error))

bot.telegram.setWebhook(URL)
bot.startWebhook(`${URL}/afisha-timepad-bot`, null, PORT)

// bot.launch()
//   .then(() =>
//     console.log(`bot started at ${new Date()}`))
//   .catch(err => console.log(err, `: err`))

