import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ConditionalResponseModel, IntentResponseResult } from '../models/intent-response.model';


class Context<T> {
  $implicit!: T;
  asResponseType!: T;

  constructor(value: T) {
    this.$implicit = value;
    this.asResponseType = value;
  }
}


@Directive({ selector: '[asResponseType]'})
export class ResponseTypeDirective<T> {

  @Input('asResponseType') set state(state: T) {}
  // static ngTemplateGuard_state(dir: ResponseTypeDirective<T>, expr: unknown): expr is CondicionalModel { return true; };

  // @Input() set asResponseType( source: T  ) {}

  // constructor (
  //   private tpl: TemplateRef<Context<T>>,
  //   private vcr: ViewContainerRef
  // ) { }

  static ngTemplateContextGuard<T>(
    dir: ResponseTypeDirective<T>,
    ctx: unknown
  ): ctx is Context<ConditionalResponseModel> {
    return true
  };
}
