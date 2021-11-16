import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config()

const myAxios = axios.create({
  baseURL: 'https://api.timepad.ru/v1',
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`
  }
})

export default myAxios
