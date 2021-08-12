import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonsService {

  constructor () { }

  cleanUndefineds<T>( object: T ): T {
    Object.keys( object ).forEach( ( key ) => {
      if ( object[ key as keyof T ] == undefined ) delete object[ key as keyof T ];
    } )
    return object
  }
}
