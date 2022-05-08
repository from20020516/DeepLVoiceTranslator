import express from 'express'
import { json, urlencoded } from "body-parser"
import { Strategy, Profile } from 'passport-twitter'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'express-jwt'
import passport from 'passport'
import querystring from 'querystring'
import session from 'express-session'
import token from 'jsonwebtoken'

dotenv.config()
const secret = process.env.app_secret as string

const app = express()
app.use(cors({ credentials: true, origin: [/^https:\/\/[a-z0-9\.]+amplifyapp\.com$/] }))
app.use(passport.initialize())
app.use(session({ secret, saveUninitialized: false, resave: false }))
app.use(passport.session())
app.use(jwt({ secret, algorithms: ['HS256'] }).unless({ path: ['/token', '/auth/twitter', '/auth/twitter/callback'], method: ['OPTIONS'] }))

passport.use(new Strategy({
  consumerKey: process.env.twitter_consumer_key as string,
  consumerSecret: process.env.twitter_consumer_secret as string,
  callbackURL: `${process.env.twitter_callback_origin as string}/auth/twitter/callback`,
}, (token, tokenSecret, profile: Profile, done) => {
  done(null, profile)
}))

const router = express.Router()
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
router.get('/auth/twitter/callback', passport.authenticate('twitter', { session: false }), async (req, res) => {
  const { id, username, photos } = req.user as Profile
  res.type('html')
  req.user
    ? (() => {
      const newJwt = token.sign({ id, username, photo: photos?.[0].value }, secret, { algorithm: 'HS256', expiresIn: 3600 })
      res.send(`<html><body><script>window.opener.postMessage('${newJwt}','*');</script></body></html>`)
    })()
    : res.send(`<html><body><script>window.close();</script></body></html>`)
})

app.use('/', router)
process.env.NODE_ENV === 'development' && app.listen(80, () => { console.log(`app listening at http://localhost`) })

export default app
