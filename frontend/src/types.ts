export interface SupportedPairsResponse {
  pairs: [string, string][];
}

export interface TranslationRequest {
  source_code: string;
  source_lang: string;
  target_lang: string;
}

export interface TranslationResponse {
  translation: string;
}