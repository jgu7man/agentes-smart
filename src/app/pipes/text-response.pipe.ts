import { Pipe, PipeTransform } from '@angular/core';
import { ResponseDisplay } from '../models/response.model';

@Pipe({
  name: 'textResponse'
})
export class TextResponsePipe implements PipeTransform {

  transform(value: ResponseDisplay, ...args: unknown[]): string {
    return typeof value === 'string' ? value : ''
  }

}
