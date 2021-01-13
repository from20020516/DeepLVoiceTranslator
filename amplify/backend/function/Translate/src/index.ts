import { APIGatewayProxyHandler } from 'aws-lambda'
import axios from 'axios'
import querystring from 'querystring'
import dotenv from 'dotenv'

dotenv.config()

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
interface Body {
  text: string
  target: string
  source: string
}

const translator = async ({ text, target, source }: Body): Promise<string> => {
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

const headers = { 'Access-Control-Allow-Origin': '*' }

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    return event.body
      ? { statusCode: 200, headers, body: await translator(JSON.parse(event.body)) }
      : { statusCode: 400, headers, body: 'Missing Payload.' }
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify(error) }
  }
}
