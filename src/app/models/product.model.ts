export class ProductModel {
  id: string;
  categorias: string[]
  sinonimos: string[]
  detalles: ProdDetalle[]
    constructor (
        public referencia: string,
        public precio: number,
        public onStock: boolean,
        public descripcion: string,
        public stockCant?: any,
        public imagenUrl?: any,
        public galeria?: any[],
        categorias?: string[],
        sinonimos?: string[],
        detalles?: ProdDetalle[],
        id?: string,
    ) {
      this.id = id || ''
      this.categorias = categorias || []
      this.sinonimos = sinonimos || []
      this.detalles = detalles || []
    }
}



export interface ProdDetalle {
    detailName: string,
    detailValue: any
}
