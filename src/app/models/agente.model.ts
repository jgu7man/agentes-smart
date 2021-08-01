export class AgenteModel {
    constructor(
        public projectId: string,
        public displayName: string,
        public defaultLanguageCode: string,
        public timeZone: string,
        public description?: string,
        public avatarUri?: ImageUri,
        public clientToken?: string,
        public developerToken?: string,
        public started?: boolean,
    ){}

}

export interface ImageUri {
    url: string
    alt: string
}
