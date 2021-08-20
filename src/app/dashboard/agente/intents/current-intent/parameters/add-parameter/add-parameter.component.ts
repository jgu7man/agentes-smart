import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MxLoading } from '@marxa/devkit';
import { iParameter } from 'src/app/models/intent.model';
import { ParametersService } from 'src/app/services/parameters.service';

@Component({
  selector: 'as-add-parameter',
  templateUrl: './add-parameter.component.html',
  styleUrls: ['./add-parameter.component.scss']
})
export class AddParameterComponent implements OnInit {

  param: iParameter
  @ViewChild( 'displayName' ) displayName!: ElementRef
  @Output() public closeRow = new EventEmitter<boolean>()

  constructor (
    public paramsService: ParametersService,
    private _loading: MxLoading
  ) {
    this.param = {
      displayName: '',
      entityTypeDisplayName: '',
      value: '',
      mandatory: false,
      isList: false
    }
  }

  async ngOnInit() {
    await this._loading.waitFor(200)
    this.displayName.nativeElement.focus()
  }


  onTipoChanged(tipo: string) {
    this.param.entityTypeDisplayName = tipo
  }

  onValueSelected( value: string ) {
    this.param.value = value
  }
}
