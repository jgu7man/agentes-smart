import { Directive, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[diagramElement]'
})
export class DiagramElementDirective implements AfterViewInit {

  @Output() getDiagramData: EventEmitter<any> = new EventEmitter()

  constructor (
    private el: ElementRef
  ) {
  }
  
  ngAfterViewInit() {
    var boundingData = this.el.nativeElement.getBoundingClientRect()
    this.getDiagramData.emit(boundingData)
    
  }

}
