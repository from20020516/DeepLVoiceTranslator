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
interface Window {
  __reactResponderSystemActive?: boolean
}
type ITwitterUser = {
  id: string
  username: string
  displayName: string
  photos: { value: string }[]
  provider: 'twitter',
  _json: {
    id: number
    id_str: string
    name: string
    screen_name: string
    location: string
    description: string
    url?: string
    entities: {
      description: {
        urls: string[]
      }
    }
    protected: boolean
    followers_count: number
    friends_count: number
    listed_count: number
    created_at: string
    favourites_count: number,
    utc_offset?: number,
    time_zone?: number,
    geo_enabled: boolean,
    verified: boolean,
    statuses_count: number,
    lang?: string,
    status: {
      created_at: string
      created_at: string
      id: number,
      id_str: string,
      text: string
      truncated: boolean,
      entities: {
        hashtags: string[],
        symbols: string[],
        user_mentions: string[],
        urls: string[]
      },
      source: string
      in_reply_to_status_id?: number,
      in_reply_to_status_id_str?: string,
      in_reply_to_user_id?: number,
      in_reply_to_user_id_str?: string,
      in_reply_to_screen_name?: string,
      geo?: string,
      coordinates?: string,
      place?: string,
      contributors?: string,
      is_quote_status: boolean,
      retweet_count: number,
      favorite_count: number,
      favorited: boolean,
      retweeted: boolean,
      lang: string
    },
    contributors_enabled: boolean,
    is_translator: boolean,
    is_translation_enabled: boolean,
    profile_background_color: string,
    profile_background_image_url: string
    profile_background_image_url_https: string
    profile_background_tile: boolean,
    profile_image_url: string
    profile_image_url_https: string
    profile_banner_url: string
    profile_link_color: string,
    profile_sidebar_border_color: string,
    profile_sidebar_fill_color: string,
    profile_text_color: string,
    profile_use_background_image: boolean,
    has_extended_profile: boolean,
    default_profile: boolean,
    default_profile_image: boolean,
    following: boolean,
    follow_request_sent: boolean,
    notifications: boolean,
    translator_type: none,
    suspended: boolean,
    needs_phone_verification: boolean
  }
  _accessLevel: string
}
