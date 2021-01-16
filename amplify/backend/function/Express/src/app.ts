import Express from 'express'
import { json, urlencoded } from "body-parser"
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import querystring from 'querystring'

dotenv.config()
const app = Express()
const router = Express.Router()
router.use(cors())
router.use(json())
router.use(urlencoded({ extended: true }))

interface IN2MTResponse {
  message: {
    '@type': string
    '@service': string
    '@version': string
    result: {
      translatedText: string
    }
  }
}
interface IDeepLResponse {
  translations: {
    detected_source_language: string
    text: string
  }[]
}
interface IBody {
  text: string
  target: string
  source: string
}

const translator = async ({ text, target, source }: IBody): Promise<string> => {
  return (source === 'KO' || target === 'KO')
    ? (await axios.post<IN2MTResponse>('https://openapi.naver.com/v1/papago/n2mt', querystring.stringify({
      text: text,
      target: String(target).toLowerCase(),
      source: String(source).toLowerCase()
    }), {
      headers: {
        'X-Naver-Client-Id': process.env.naver_client_id,
        'X-Naver-Client-Secret': process.env.naver_client_secret
      }
    })).data.message.result.translatedText
    : (await axios.post<IDeepLResponse>('https://api.deepl.com/v2/translate', querystring.stringify({
      auth_key: process.env.auth_key,
      text: text,
      target_lang: target,
    }))).data.translations[0].text
}

router.post('/translate', async (req, res, next) => {
  try {
    return res.send(JSON.stringify(await translator(req.body)))
  } catch (error) {
    return res.send(JSON.stringify(error))
  }
})

router.get('/*', async (req, res, next) => {
  const { method, path, query } = req
  return res.send(JSON.stringify({ method, path, query }))
})

app.use('/', router)

export default app
