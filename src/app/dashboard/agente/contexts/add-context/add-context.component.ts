import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MxText } from '@marxa/devkit';
import { iContext } from 'src/app/models/context.model';
import { ContextsService } from 'src/app/services/contexts.service';

@Component({
  selector: 'as-add-context',
  templateUrl: './add-context.component.html',
  styleUrls: ['./add-context.component.scss']
})
export class AddContextComponent implements OnInit {

  public contextNameCtrl: FormControl = new FormControl( '', [Validators.required] )
  @Output() contextAdded: EventEmitter<any> = new EventEmitter();
  @Output() unfocus: EventEmitter<any> = new EventEmitter();
  @ViewChild('contextoNuevo') contextoNuevo!: ElementRef;
  @Input() lastIndex?: number;

  constructor(
    public text: MxText,
    private _contextos: ContextsService,
  ) {}

  ngOnInit(): void {}

  onSetContext() {
    this._contextos.set( this.contextNameCtrl.value, this.lastIndex )
      .then( () => {
        this.contextAdded.emit(this.contextNameCtrl.value)
        this.contextNameCtrl.patchValue('');
      });
  }



}
