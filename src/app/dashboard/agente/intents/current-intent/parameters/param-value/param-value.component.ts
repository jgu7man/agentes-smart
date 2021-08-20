import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'as-param-value',
  templateUrl: './param-value.component.html',
  styleUrls: ['./param-value.component.scss']
})
export class ParamValueComponent implements OnInit {

  @Input() paramValue!: string
  valueOptions: string[] = []
  @Output() paramValueSelected = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
    let paramSplit = this.paramValue.split( '.' )
    let original = paramSplit[1]
    this.valueOptions.push(
      original ? paramSplit[ 0 ] : this.paramValue + '.original'
    )
    this.valueOptions.push( this.paramValue )
  }

  onSelected(selection: MatSelectChange) {
    this.paramValueSelected.emit(selection.value)
  }

}
