export interface RespuestaMensaje {
    message:
    RespuestaText |
    RespuestaImage |
    RespuestaRapida |
    RespuestaCard |
    RespuestaPayload |
    RespuestaSimples |
    RespuestaSugerencias |
    RespuestaLinkExterno
}

export interface RespuestaText {
    text: string[]
}
export interface RespuestaImage {
    imageUri: string,
    accessibilityText: string
}
export interface RespuestaRapida {
    title: string,
    quickReplies: [
        string
    ]
}
export interface RespuestaCard {
    title: string,
    subtitle?: string,
    body?: string,
    imageUri?: string,
    buttons?: CardButton[]
}export interface CardButton {
        text?: string,
        postback?: string
}

export interface RespuestaPayload {

}
export interface RespuestaSimples {
    simpleResponses: VoiceOrText[]
}interface VoiceOrText {
        textToSpeech: string,
        ssml: string,
        displayText?: string
    }

export interface RespuestaSugerencias {
    suggestions: Suggest[]
}export interface Suggest {
    title: string
}
export interface RespuestaLinkExterno {
    destinationName: string,
    uri: string
}
