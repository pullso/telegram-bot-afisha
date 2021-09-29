import {bot} from "./src/bot.js";
import {connectDb} from './src/connectDb.js'

connectDb().catch(error => console.error(error))

bot.launch()
  .then(() =>
    console.log(`bot started at ${new Date()}`))
  .catch(err => console.log(err, `: err`))

