import cron from 'node-cron'
import axios from 'axios'

const url = 'https://telegram-afisha.herokuapp.com/'

class CronController {
  async ping() {
    console.log(new Date(), url, `: ping server`,)
    try {
      await axios.get(url)
    } catch (error) {
      console.log(error?.message);
    }
  }

  start() {
    console.log(`cron started`)
    cron.schedule('* */15 * * * *', this.ping, {})
  }
}

export default new CronController()
