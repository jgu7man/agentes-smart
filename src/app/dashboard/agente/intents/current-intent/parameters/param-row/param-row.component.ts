import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MxLoading } from '@marxa/devkit';
import { iParameter } from 'src/app/models/intent.model';
import { ParametersService } from 'src/app/services/parameters.service';

@Component({
  selector: 'as-param-row',
  templateUrl: './param-row.component.html',
  styleUrls: ['./param-row.component.scss']
})
export class ParamRowComponent implements OnInit {

  @Input() param!: iParameter
  switchNameInput: boolean = false
  switchTipoSelecter: boolean = false
  prevDisplayName: string = ''
  @ViewChild( 'displayName' ) displayNameInput!: ElementRef

  constructor (
    public params_: ParametersService,
    private _loading: MxLoading
  ) { }

  ngOnInit(): void {
  }

  onValueSelected( value: string ) {
    this.param.value = value
    this.params_.update(this.param)
  }

  async toEditDisplayName() {
    this.switchNameInput = true
    this.prevDisplayName = this.param.displayName
    await this._loading.waitFor( 100 )
    this.displayNameInput.nativeElement.focus()
  }

  toEditTipo() {
    this.switchTipoSelecter = true
  }

  onDisplayNameChanged(event: any) {
    event.stopImmediatePropagation()
    if(this.param.displayName != this.prevDisplayName)
    this.params_.update(this.param)
  }

  onTipoChanged(tipo: string) {
    this.param.entityTypeDisplayName = tipo
    this.params_.update(this.param)
  }


  onMandatoryChange(event: MatCheckboxChange) {
    this.param.mandatory = event.checked
    this.params_.update(this.param)
  }

  onIslistChange(event: MatCheckboxChange) {
    this.param.isList = event.checked
    this.params_.update(this.param)
  }

  onDeleteParam() {
    this.params_.delete(this.param)
  }


}
