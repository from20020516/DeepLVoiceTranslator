interface ILanguages {
  language: string
  name: string
  flag: string
}
interface ITranslation {
  time: string
  timestamp: number
  text: string
  source: ILanguages
  target: ILanguages
}
interface User {
  id: string
  username: string
  photo?: string
  iat: number
  exp: number
}
