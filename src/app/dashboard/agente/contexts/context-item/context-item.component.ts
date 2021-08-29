import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MxLoading, MxText } from '@marxa/devkit';
import { iContext } from 'src/app/models/context.model';
import { ContextsService } from 'src/app/services/contexts.service';

@Component({
  selector: 'as-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.scss']
})
export class ContextItemComponent implements OnInit {




  @Input() contextId!: string
  @Input() contexto!: iContext
  editedContext:string = ''
  switchEditContext: boolean = false
  @ViewChild( 'contextEditing' ) contextEditing!: ElementRef
  @Output() contextEdited: EventEmitter<any> = new EventEmitter()

  constructor (
    public _text: MxText,
    private _contextos: ContextsService,
    private _loading: MxLoading
  ) {

   }

  ngOnInit(): void {

  }

  @Input() async toEditContext( context: string ) {
    this.switchEditContext = true
    this.editedContext = context
    await this._loading.waitFor( 100 )
    this.contextEditing.nativeElement.focus()
  }

  onEditContext() {
    if ( this.editedContext ) {
      var editedContext = this._text.normalize( this.editedContext )

      this.contexto.name = editedContext

      this._contextos.set( editedContext )
        .then( () => {
          this.editedContext = ''
          this.contextEdited.emit(true)
        } )
    }
    this.switchEditContext = false
  }

  delSpaces( e: any ) {
    if ( e.which === 32 ) {
      this.editedContext.valueOf().replace( /\s/g, '' )
      return false
    } else return true

  }

}
