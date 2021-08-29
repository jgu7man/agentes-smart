import { Pipe, PipeTransform } from '@angular/core';
import { orderBy, sortBy } from 'lodash';

@Pipe({
  name: 'sortBy'
})
export class SortPipe implements PipeTransform {

  transform<T>(list: T[], order: 'asc' | 'desc' = 'asc', column: string = ''): T[] {
    if ( !list  || !order ) { return list; } // no array
    if ( list.length <= 1 ) { return list; } // array with only one item
    if ( !column || column === '' ) {
      if ( order === 'asc' ) { return list.sort() }
      else { return list.sort().reverse(); }
    } // sort 1d array
    return orderBy( list, [ column ], [ order ] );
  }

}
