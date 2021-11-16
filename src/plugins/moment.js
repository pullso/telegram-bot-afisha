import moment from 'moment-timezone'

const myMoment = moment
myMoment.locale('ru')
myMoment.tz.setDefault('Europe/Moscow')

export default myMoment
