interface ApiUsage {
    character_count: number
    character_limit: number
}
interface Languages {
    language: string
    name: string
}
interface Language {
    source: {
        value: string | number
        index: number
    }
    target: {
        value: string | number
        index: number
    }
}
interface Translation {
    translations: {
        detected_source_language: string
        text: string
    }[]
}
interface TranslationResult {
    time: string
    timestamp: number
    source: string
    target: string
}
