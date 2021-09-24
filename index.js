

import {bot} from "./src/bot.js";
import {connectDb} from './src/connectDb.js'

connectDb().catch(error => console.error(error))
bot.launch()

