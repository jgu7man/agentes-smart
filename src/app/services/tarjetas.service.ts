import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from '@angular/fire/firestore';
import {
  MxAlert,
  MxCache,
  MxCommonsService,
  MxErrorAlertModel,
} from '@marxa/devkit';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { TarjetaModel } from '../models/tarjeta.model';

@Injectable({
  providedIn: 'root',
})
export class TarjetasService {
  /** Almacena el array de Tarjetas */
  public list: TarjetaModel[] = [];

  public list$: BehaviorSubject<TarjetaModel[]> = new BehaviorSubject<
    TarjetaModel[]
  >([]);

  constructor(
    private _afs: AngularFirestore,
    private _alert: MxAlert,
    private _commons: MxCommonsService,
    private _cache: MxCache
  ) {
    this.listen();
  }

  cardsPath(functionName?: string) {
    const clientId = this._cache.getDataKey<string>('userId');

    if (!clientId) {
      throw new MxErrorAlertModel(
        `No se encontró el clientId`,
        `cards.service#${functionName}`
      );
    } else {
      let path = `usuarios/${clientId}/cards`;
      return path;
    }
  }

  /**
   * Genera la ruta para suscribirse a los cambios de las tarjetas en FIRESTORE y retorna la lista
   * @returns {*}  {Promise<TarjetaModel[]>} Array de tarjetas
   */
  listen(): Observable<TarjetaModel[]> {
    const path = this.cardsPath('cardsPath');

    return this._afs.collection<TarjetaModel>(path).valueChanges();
  }

  async get(): Promise<TarjetaModel[]> {
    const path = this.cardsPath( 'cardsPath' );
    let cardsCol = await this._afs.collection<TarjetaModel>( path ).ref.get()
    return cardsCol.docs.map(doc => doc.data())
  }

  // CREATE
  /**
   * Crea una tarjeta
   *
   * @param {TarjetaModel} tarjeta TarjetaModel
   * @returns {*} void
   */
  async addTarjeta(tarjeta: TarjetaModel) {
    console.log(tarjeta);
    Object.keys(tarjeta).forEach((key) => {
      if (tarjeta[key as keyof TarjetaModel] == undefined)
        delete tarjeta[key as keyof TarjetaModel];
    });

    tarjeta.name = await this._commons.preventDuplicated(
      tarjeta,
      this.list,
      'name'
    );
    console.log(tarjeta.name);

    try {
      await this._afs
        .collection(this.cardsPath('add'))
        .ref.add({ ...tarjeta })
        .then((res) => {
          res.update({ id: res.id });
        });
      this._alert.notify('Tarjeta creada', 'ok');
      return;
    } catch (error) {
      this._alert.error('Ups! Algo salio mal', error);
    }
  }

  // UPDATE
  /**
   * Guarda los cambios en la tarjeta
   *
   * @param {TarjetaModel} tarjeta TarjetaModel
   * @returns {*} void
   */
  async saveTarjeta(tarjeta: TarjetaModel) {
    try {
      await this._afs
        .collection(this.cardsPath('save'))
        .doc(tarjeta.id)
        .set({ ...tarjeta }, { merge: true });
      this._alert.notify('Tarjeta guardada', 'ok');
      return;
    } catch (error) {
      this._alert.error('Ups! Algo salio mal', error);
    }
  }

  // DELETE
  /**
   * Elimina la tarjeta de FIRESTORE
   *
   * @param {string} tarjetaID identificador de la tarjeta
   */
  async deleteTarjeta(tarjetaID: string) {
    try {
      await this._afs.collection(this.cardsPath('add')).doc(tarjetaID).delete();
    } catch (error) {
      this._alert.error('Ups! Algo salio mal', error);
    }
  }
}
