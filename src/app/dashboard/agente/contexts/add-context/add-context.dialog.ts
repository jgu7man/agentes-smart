import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MxText } from '@marxa/devkit';
import { iContext } from 'src/app/models/context.model';
import { ContextsService } from 'src/app/services/contexts.service';

@Component({
  templateUrl: './add-context.dialog.html',
  styleUrls: ['./add-context.dialog.scss'],
})
export class AddContextDialog implements OnInit {
  newContext: string = '';
  switchAddContext: boolean = false;
  @Output() contextAdded: EventEmitter<any> = new EventEmitter();
  @Output() unfocus: EventEmitter<any> = new EventEmitter();
  @ViewChild('contextoNuevo') contextoNuevo!: ElementRef;
  @Input() lastIndex!: number;

  constructor(
    private _text: MxText,
    private _contextos: ContextsService,
    // private _loading: GdevLoading
  ) {}

  ngOnInit(): void {}

  onSetContext() {
    if (this.newContext) {
      var newContextName = this._text.normalize(this.newContext);
      var newContext: iContext = {
        contextName: newContextName,
        lifespanCount: 3,
        index: this.lastIndex,
      };
      this._contextos.set(newContext).then(() => {
        this.newContext = '';
        this.contextAdded.emit(true);
      });
    }
    this.switchAddContext = false;
  }

  delSpaces(e: any) {
    if (e.which === 32) {
      this.newContext.valueOf().replace(/\s/g, '');
      return false;
    } else return e.which;
  }
}
