import _ from "lodash";
import {getEvents} from "../../api.js";
import moment from "../../plugins/moment.js";

class EventsService {
  prepareEvents(data) {
    const {values} = data
    const events = _.groupBy(values, 'name')
    _.each(events, groupEvent => {
      if (groupEvent.length > 1) {
        const name = groupEvent[0].name

        const result = {
          name,
          id: _.map(groupEvent, e => e.id),
          starts_at: _.map(groupEvent, e => e.starts_at),
          url: _.map(groupEvent, e => e.url)
        }

        events[name] = [result]
      }
    })

    return _.values(events).map(el => el[0])
  }

  async getEvents(ctx) {
    const options = {
      ...ctx?.session?.settings,
      ...ctx?.session?.user?.options,
      ...getFormattedDates(ctx?.session?.settings?.date)
    }
    delete options.date

    try {
      const {data} = await getEvents(options)
      return data || []
    } catch (e) {
      console.log(e, `:api error`)
    }
  }

  async getEventsResponse(ctx) {
    const session = ctx.session
    const {pageIndex, pageSize} = ctx.session?.page
    if (!session.events) return {}

    const sessionEvents = [...session?.events]

    const events = paginate(
      sessionEvents,
      session.page
    )

    // TODO remove console
    console.log(events.length, `: events.length`)
    if (!events.length) return null

    const isLastPage = Math.ceil(sessionEvents.length / pageSize) === pageIndex
    session.page.pageIndex = isLastPage ? 1 : pageIndex + 1;
    const prevValue = session.page.pageIndex
    setTimeout(() => {
      if (prevValue === session.page.pageIndex) session.page.pageIndex = 1
    }, 1 * 60 * 1000)

    const date = _.isArray(events[0]?.starts_at)
      ? events[0]?.starts_at[0]
      : events[0]?.starts_at

    const title = `<b>Афиша на ${moment(date).format('L')}</b> от @afishatimepadbot`

    const response = [
      title,
      ...events
        .map(event => {
          const time = _.isArray(event.starts_at)
            ? _.map(event.starts_at, t => moment(t).format('HH:mm')).join(', ')
            : moment(event.starts_at).format('HH:mm')

          const name = event.name.replace(/&amp;quot;/g, '"')

          const url = `<a href="${_.isArray(event.url)
            ? event.url[0] : event.url}">${name}</a>`

          const category = event?.categories?.length ? `(${event?.categories[0]?.name})` : ''

          return [time, url, category].join(' ')
        }),
    ]

    if (isLastPage) response.push('Ну вот и все, ребята🤷‍♂️')

    return {response, isLastPage}
  }
}

function getFormattedDates(text) {
  const settings = {}
  if (text === 'Завтра') {
    settings.starts_at_min = moment().add(1, 'days').startOf('day').format()
    settings.starts_at_max = moment().endOf('day').add(1, 'days').format()
  } else if (text === 'Выходные') {
    settings.starts_at_min = moment().day(6).startOf('day').format()
    settings.starts_at_max = moment().day(7).endOf('day').format()
  } else {
    settings.starts_at_max = moment().endOf('day').format()
  }
  return settings
}


function paginate(array, {pageIndex, pageSize}) {
  if (!array) return null
  return _.slice(array, (pageIndex - 1) * pageSize, pageIndex * pageSize)
}

export default new EventsService()
