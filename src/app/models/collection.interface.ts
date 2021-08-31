
export class ColeccionModel {
    constructor (
        public name: string,
        public saveKeys?: ParamExpected[],
        public dataGetted?: any[]
    ){}
}



export interface ParamExpected {
    param: string
}