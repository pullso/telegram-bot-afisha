import moment from "moment-timezone";
import _ from "lodash";

export function paginate(array, {pageSize, pageIndex}) {
  if (!array) return null
  return _.slice(array, (pageIndex - 1) * pageSize, pageIndex * pageSize)
}

export function getFormattedDates(text) {
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
