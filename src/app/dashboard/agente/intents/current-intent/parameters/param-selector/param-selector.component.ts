import { Subscription } from 'rxjs';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { iParameter, iParamSelected } from 'src/app/models/intent.model';
import { ParametersService } from 'src/app/services/parameters.service';
import { MxLoading } from '@marxa/devkit';
import { CurrentIntentService } from 'src/app/services/current-intent.service';

@Component({
  selector: 'as-param-selector',
  templateUrl: './param-selector.component.html',
  styleUrls: ['./param-selector.component.scss'],
})
export class ParamSelectorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() paramSelected!: iParamSelected;
  @Input() focused: boolean = false;
  @ViewChild('paramSelector') public selector!: MatSelect;
  @Output() onParamaSelected: EventEmitter<iParamSelected> = new EventEmitter();
  isOriginal: boolean = false;
  paramList: iParameter[] = [];
  paramsSubscription!: Subscription;

  constructor(
    public _params: ParametersService,
    private _loading: MxLoading,
    // public respuestas_: RespuestasService,
  ) {
    // this.paramsSubscription =
    //   this._mensaje.state$.subscribe( intentState => {
    //   if (intentState) this.paramList = intentState.intent.parameters;
    // });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this._loading.waitFor(1000);
    if (this.focused) this.selector.open();
  }

  async onOpenedChange(toggle: boolean) {
    // if (!toggle) {
    //     await this._loading.waitFor(500)
    //     console.log(this.paramSelected);
    //     this.onParamaSelected.emit({
    //         value: this.paramSelected.value,
    //         isOriginal: this.isOriginal,
    //     });
    // }
  }

  async onParamChange(selected: MatSelectChange) {
    if (!this.paramSelected || !this.paramSelected.value)
      this.paramSelected = { value: '', isOriginal: false };

    this.paramSelected.value = selected.value;
    if (this.paramSelected) {
      let paramFound = await this._params.getByName(this.paramSelected.value);
      if (paramFound) {
        let value = paramFound.value
          ? paramFound.value
          : paramFound.displayName;

        this.paramSelected.value = value;
        this.isOriginal = value.split('.').length > 1 ? true : false;
      } else {
        this.paramSelected.value = `$${this.paramSelected}`;
        this.isOriginal = true;
      }

      this.paramSelected.isOriginal = this.isOriginal;
      this.onParamaSelected.emit(this.paramSelected);
    }
  }

  ngOnDestroy() {
    if (this.paramsSubscription) this.paramsSubscription.unsubscribe();
  }
}

