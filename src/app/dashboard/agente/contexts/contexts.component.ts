import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { QueryList } from '@angular/core';
import { Component, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { MxLoading } from '@marxa/devkit';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { iAgente } from 'src/app/models/agent.model';
import { iContext } from 'src/app/models/context.model';
import { ContextsService } from 'src/app/services/contexts.service';
import { CurrentAgentService } from 'src/app/services/current-agent.service';
import { AddContextComponent } from './add-context/add-context.component';
import { AddContextDialog } from './add-context/add-context.dialog';
import { ContextItemComponent } from './context-item/context-item.component';

@Component({
  selector: 'as-contexts',
  templateUrl: './contexts.component.html',
  styleUrls: ['./contexts.component.scss']
})
export class ContextsComponent implements OnInit, OnDestroy {

  // agente: iAgente
  switchAddContext: boolean = false
  switchEditContext: boolean = false
  list: iContext[] = []
  list$: Observable<iContext[]>
  contextToEdit: string = ''

  @ViewChild(AddContextComponent) addContext!: AddContextComponent

  @ViewChildren( ContextItemComponent ) contextCols!: QueryList<ContextItemComponent>

  constructor (
    public contextos: ContextsService,
    private _loading: MxLoading,
    public agente_: CurrentAgentService
  ) {

    this.list$ = this.contextos.list$
      ? this.contextos.list$
      : this.agente_.loaded$.pipe(
        flatMap(() => this.contextos.list$)
      )

      this.list$.subscribe(list => {
        this.list = list;
      })

  }

  async ngOnInit() {
    this.getContextos()
  }

  trackContextById( index: number, context: iContext ) {
    return context.id
  }

  toEdit(contexto: iContext) {
    var column = this.contextCols.find( contextCol => contextCol.contextId == contexto.id )
    if ( column ) {
      column.toEditContext(contexto.name)
    }
  }


  async toAddContext() {
    this.switchAddContext = !this.switchAddContext
    await this._loading.waitFor( 100 )
    this.addContext.contextoNuevo.nativeElement.focus()
  }



  drop( event: CdkDragDrop<any> ) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex)
    this.list = this.list.map((i, index) => { return {...i, index } })
    this.contextos.updateIndex(this.list)
  }

  grabEffect( element: any ) {
    var el:HTMLElement = element.target
    el.classList.add('grabbed')
  }

  ungrab( element: any ) {
    var el: HTMLElement = element.target
    el.classList.remove( 'grabbed' )
  }



  async getContextos() {
    // let contextos = await this._contextos.getAllContexts( )
    // this.contextos = contextos.length > 0 ? contextos : undefined
  }



  ngOnDestroy(): void {
    this.contextos.unsubscribeAllContext()
  }





  toDeleteContext( contexto: iContext ) {
    this.contextos.delete( contexto ).then( () => {
      this.getContextos()
    } )
  }

}
