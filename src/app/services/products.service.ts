import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import firebase from 'firebase/app';
import { MxAlert, MxCache, MxErrorAlertModel } from '@marxa/devkit';
import { ProductModel } from '../models/product.model';
import { iEntity, iEntityType, EntityTypeModel } from '../models/entity-type.model';
import { AgenteModel } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  imageUrl: Subject<{}> = new Subject();
  galleyImageUrl: Subject<{}> = new Subject();
  imageLoadPercent: number | undefined;
  usuario: firebase.User | null;
  tiposRef?: firebase.firestore.CollectionReference
  projectId?: string
  entityName?: string
  private _url = environment.restURL + 'entity';

  constructor(
    private _afs: AngularFirestore,
    private _as: AngularFireStorage,
    private _alert: MxAlert,
    private _cache: MxCache,
    private _http: HttpClient
  ) {
    this.usuario = this._cache.getDataKey('user')
  }

  get usuarioRef() {
    if  (this.usuario)
      return this._afs.doc( `usuarios/${ this.usuario.uid }` ).ref;
    else return null;
  }

  get productsRef() {
    if (this.usuarioRef)
      return this.usuarioRef.collection( 'productos' );
    else return null;
  }

  private async getTiposCol() {
    try {
      if ( !this.usuario ) {
        const error = new MxErrorAlertModel( `No se encontró el usuario`, 'getTiposCol' );
        throw error
      } else {

        const usuarioRef = this._afs.doc( `usuarios/${ this.usuario.uid }` )
        let agentPath;
        var agentsCol = await usuarioRef.collection<AgenteModel>('agentes').ref.get()

        if ( agentsCol.size > 0 ) {
          agentPath = agentsCol.docs[0].ref.path
          this.projectId = agentsCol.docs[0].id
          return this.tiposRef = this._afs.doc(agentPath).collection('tipos').ref
        } else {
          return null
        }
      }
    } catch ( error ) {
      if ( 'message' in error ) {
        throw error
      } else {
        throw new MxErrorAlertModel(
          `Error obteniendo los Tipos de ${ this.projectId }`,
          'getTiposCol'
        )
      }
    }
  }

  async productTypeRef() {
    const tiposCol = await this.getTiposCol()
    if (tiposCol) {
      let entityDoc = await tiposCol.where('displayName', '==', 'productos').get()
      if (!entityDoc.empty) {
        this.entityName = entityDoc.docs[0].id
        return entityDoc.docs[0].ref
      } else {
        return null
      }
    } else {
      return null
    }
    // return this.usuarioRef.collection('config_docs').doc('product_types');
  }

  async addProduct(product: ProductModel) {
    try {

      if ( !this.usuario ) {
        const error = new MxErrorAlertModel( `No se encontró el usuario`, 'addProduct' );
        throw error
      } else if ( 'referencia'! in product ) {
        const error = new MxErrorAlertModel( `No se encontró la referencia del producto`, 'addProduct' );
        throw error
      } else {
        const productsRef = this._afs.collection(`usuarios/${this.usuario.uid}`)
        var productId: string = product.referencia
          .split(' ')
          .join('-')
          .toLowerCase();
        var dotsSplit = productId.split('.');
        productId = dotsSplit.length == 1 ? productId : dotsSplit.join('_');

        Object.keys(product).forEach((key) => {
          if ( product[ key as keyof ProductModel ] == undefined )
            delete product[ key as keyof ProductModel];
        });

        if ( productsRef ) {
          // Save product in usuario/products
          await productsRef.doc(productId).set({...product});
          // Save product on tipos
          if (product.sinonimos) {
            await this.saveProductTipo(product.referencia, product.sinonimos, productId);
          }

          this._alert.notify('Producto agregado');
          return;

        } else {
          throw new MxErrorAlertModel(
            'No se pudo guardar el producto  por que no se tiene la referencia a firestore',
            'addProduct'
          )
        }
      }

    } catch ( error ) {
      if ( 'message' in error ) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error('No se pudo guardar', error);
      }
      return console.log(error);
    }
  }

  async saveProductTipo(
    referencia: string,
    sinonimos: string[],
    entity: string
  ) {
    try {
      if ( !referencia ) {
        const error = new MxErrorAlertModel( `No hay referencia del producto`, 'saveProductTipo' );
        throw error
      } else if ( !sinonimos ) {
        const error = new MxErrorAlertModel( `No hay sinónimos`, 'saveProductTipo' );
        throw error
      } else if ( !entity ) {
        const error = new MxErrorAlertModel( `No hay entity donde agregarlos`, 'saveProductTipo' );
        throw error
      } else {
        var productClase: iEntity = {
          value: entity,
          synonyms: [
            ...sinonimos.filter(s => s != referencia),
            referencia
          ],
        };

        var typeRef = await this.productTypeRef()

        if (typeRef) {
          var typesDoc = await  typeRef.get()
          let productType = typesDoc.data() as EntityTypeModel;
          productType.entities = [
            ...productType.entities.filter(e => e.value != productClase.value),
            productClase
          ];

          await this._updateProductEntity( productType )
          await (await this.productTypeRef())?.update({ entities: productType.entities })
        } else {
          console.log('No existen tipos');
          let newTipo: iEntityType = new EntityTypeModel(
            'productos',
            'KIND_MAP',
            'AUTO_EXPANSION_MODE_DEFAULT',
            [productClase],
            true,
          );

          let entity = await this._createProductsEntity(newTipo);
          if (entity) {
            let id = entity.name?.slice(entity.name.lastIndexOf('/') + 1)
            newTipo.name = entity.name ;
            let entityPath = `agentes/${this.projectId}/tipos`
            this.usuarioRef?.collection(entityPath).doc(id).set({...newTipo})
          }
        }
      }
    } catch (error) {
      console.error( error );
      if ( 'message' in error ) {
        this._alert.error(error.message, error)
      } else {
        this._alert.error('No se pudo guardar los sinónimos', error);
      }
    }
  }


/** Crea el entity en el backend */
private _createProductsEntity(
  productsEntity: iEntityType
): Promise<EntityTypeModel> {
  return new Promise((resolve, reject) => {
    this._http.post(
        `${this._url}/${this.projectId}`,
        { entityType: { ...productsEntity } },
        { responseType: 'json' }
      ).subscribe((result: any) => {
        if (result['status'] == 'success')  {
          //exito creado
          let entity = result['result']

          resolve(entity);
        } else {
          reject( {
            message: 'No se pudo crear la entidad',
            document: 'products.service#_createProductsEntity'
          } )
        }
      }, (err) => {
        if (err) {
          console.error(err);
          this._alert.error(
            'No fué posible crear la entidad de productos.',
            err
          );
        }
        reject(err);
      });
  });
}

  async addProductImage(file: any) {
    const dateId = new Date().getTime(),
      fileName = `${dateId}-${file.name}`,
      path = `${this.usuario?.uid}/products/${fileName}`,
      ref = this._as.ref(path),
      task = this._as.upload(path, file);

    await task.percentageChanges().subscribe((res) => {
      return (this.imageLoadPercent = res);
    });

    await task
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          await ref.getDownloadURL().subscribe((res) => {
            this.imageUrl.next({ url: res, alt: file.name });
          });
          return;
        })
      )
      .subscribe();
  }

  async loadGalleryImage(image: any) {
    let dateId = new Date().getTime(),
      fileName = `${dateId}-${image.name}`,
      path = `${this.usuario?.uid}/products/${fileName}`,
      ref = this._as.ref(path),
      task = this._as.upload(path, image);

    await task
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          await ref.getDownloadURL().subscribe((res) => {
            this.imageUrl.next({ url: res, alt: image.name });
          });
          return;
        })
      )
      .subscribe();
  }

  async getProduct(productId: string) {
    try {
      const productRef = this.productsRef?.doc(productId);
      const productDoc = await productRef?.get();
      var product = productDoc?.data() as ProductModel;
      return product;
    } catch (error) {
      console.log( error );
      return null
    }
  }

  async updateProduct(product: ProductModel) {
    try {
      var productObject = {};
      productObject = { ...productObject, ...product };
      console.log(productObject);
      await this.productsRef?.doc(product.id).update(productObject);
      let typesDoc = await (await this.productTypeRef())?.get();
      let type = typesDoc?.data() as iEntityType
      var productClase: iEntity = {
        value: product.id,
        synonyms: [
          ...product.sinonimos.filter(s => s != product.referencia),
           product.referencia
        ],
      };

      type.entities = [
        ...type.entities.filter(e => e.value != productClase.value),
        productClase
      ];
      this._updateProductEntity(type);
      (await this.productTypeRef())?.update({ entities: type.entities });

      this._alert.notify('Producto guardado');
      return true;
    } catch (error) {
      this._alert.error('Ups, algo falló. No se guardó', error);
      console.error( error );
      return
    }
  }

  /** Actualiza la Entity en el backend */
  private _updateProductEntity(entityType: iEntityType) {
    return new Promise((resolve, reject) => {
      this._http
        .put(this._url, { entityType: entityType })
        .toPromise()
        .then((result) => {
          console.info('Entity updated', result);
          this._alert.notify('Tipo guardado');
          resolve(true);
        })
        .catch((err) => {
          if (err) {
            console.error(err);
            this._alert.error(
              'No fué posible crear ese Tipo en este momento.',
              err
            );
          }
          reject(err);
        });
    });
  }


  async onDelAttr(itemAttr: any) {
    var itemId = itemAttr.idItem,
      itemAttr = itemAttr.attrItem;
    this.productsRef?.doc(itemId).update({
      [itemAttr]: firebase.firestore.FieldValue.delete(),
    });
    this._alert.notify('Atributo de producto eliminado');
    return;
  }

  async delProduct(productId: string) {
    try {
      const prodRef = this.productsRef?.doc(productId);
      var prodDoc = await prodRef?.get();
      var prodName = await prodDoc?.get('referencia');
      await prodRef?.delete();

      const typeRef = await this.productTypeRef()
      var products_type = await typeRef?.get();
      var type = products_type?.data() as iEntityType
      var entity = type.entities.findIndex((e) => e.value == prodName);
      type.entities.splice(entity, 1);
      this._updateProductEntity(type)
      typeRef?.set({ entities: type.entities }, { merge: true });

      return;
    } catch (error) {
      return console.error(error);
    }
  }


  async delEntityProduct() {

  }

  async setProductTypesStatus(status: 'saved' | 'unsaved' | 'created') {
    const configDocRef = this.usuarioRef?.collection('config_docs')
      .doc('products_types');

    try {
      configDocRef?.set({ status }, { merge: true });
      this._alert.notify(
        `Tipo de datos 'producto' ahora es ${status}`
      );
    } catch (error) {
      console.error(error);
      this._alert.error(
        'Se intentó guardar el tipo de datos de productos y ocurrió un error',
        error
      );
    }
  }
}
