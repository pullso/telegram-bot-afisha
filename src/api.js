import axios from "./plugins/axios.js";
import qs from 'querystring'

export async function getEvents(options = {}) {
  const opt = {
    skip: 0,
    limit: 100,
    moderation_statuses: 'featured',
    sort: 'starts_at',
    ...options
  }

  return await axios.get(`/events.json?${qs.stringify(opt)}`)
    .catch(err => console.log(err, `: api error`))
}
