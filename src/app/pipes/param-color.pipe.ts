import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { iAgentParameter } from '../models/parameter.model';
import { ParametersService } from '../services/parameters.service';

@Pipe({
  name: 'paramColor'
})
export class ParamColorPipe implements PipeTransform, OnDestroy {

  agentParams: iAgentParameter[] = []
  private agentParamsSubs!: Subscription

  constructor (
    public params_: ParametersService,
  ) {
    this.params_.getAgentParams().subscribe( params => {
      console.log( params )
      this.agentParams = params || []
    })
  }

  transform(displayName: string | boolean): string {
    let param = this.agentParams.find(
      (p) => p.displayName == displayName
    )
    console.log( this.agentParams )
    console.log( param )
    return param ? param.color : '#ffee588c';
  }

  ngOnDestroy() {
    this.agentParamsSubs.unsubscribe()
  }


}
