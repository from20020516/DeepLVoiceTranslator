interface ILanguages {
  language: string
  name: string
}
interface ITranslation {
  time: string
  timestamp: number
  text: string
  source: string
  target: string
}
interface User {
  id: string
  username: string
  photo?: string
  iat: number
  exp: number
}
