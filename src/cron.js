import cron from 'node-cron'
import axios from 'axios'

const serverURL = 'https://telegram-afisha.herokuapp.com/'

async function pingServer() {
  console.log(new Date(), serverURL, `: ping server`,)
  try {
    await axios.get(serverURL)
  } catch (err) {
    console.log(err, `: err`)
  }
}

export function cronStart() {
  console.log(`cron started`)
  cron.schedule('*/15 * * * *', pingServer, {})
}

