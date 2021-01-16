import Express from 'express'
import { json, urlencoded } from "body-parser"
import { Strategy } from 'passport-twitter'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'express-jwt'
import passport from 'passport'
import querystring from 'querystring'
import session from 'express-session'

dotenv.config()

const app = Express()
app.use(passport.initialize())
app.use(session({ secret: 'keyboard cat' }))
app.use(passport.session())

passport.use(new Strategy({
  consumerKey: process.env.twitter_consumer_key as string,
  consumerSecret: process.env.twitter_consumer_secret as string,
  callbackURL: 'http://localhost/auth/twitter/callback',
}, (token, tokenSecret, profile, done) => {
  done(null, profile)
}))

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

router.post('/translate', async (req, res) => {
  try {
    return res.send(JSON.stringify(await translator(req.body)))
  } catch (error) {
    return res.send(JSON.stringify(error))
  }
})

router.get('/auth/twitter', passport.authenticate('twitter'))
router.get('/auth/twitter/callback', passport.authenticate('twitter', { session: false }), async (req, res) => { res.json(req.user) })

app.use('/', router)
process.env.NODE_ENV === 'development' && app.listen(80, () => { console.log(`app listening at http://localhost`) })

export default app
