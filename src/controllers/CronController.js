import cron from 'node-cron'
import axios from 'axios'

class CronController {
  constructor(url) {
    this.url = url
  }

  async ping() {
    console.log(new Date(), this.url, `: ping server`,)
    try {
      await axios.get(this.url)
    } catch (error) {
      console.log(error?.message);
    }
  }

  start() {
    console.log(`cron started`)
    cron.schedule('* */15 * * * *', this.ping, {})
  }
}

export default new CronController(process.env.WEBHOOK_URL)
