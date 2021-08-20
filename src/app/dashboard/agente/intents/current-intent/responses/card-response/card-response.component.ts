import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilKeyChanged, take } from 'rxjs/operators';
import { CardButton } from 'src/app/models/dialogflow-responses.model';
import { TarjetaModel } from 'src/app/models/tarjeta.model';
import { CurrentAgentService } from 'src/app/services/current-agent.service';
import { TarjetasService } from 'src/app/services/tarjetas.service';

@Component({
  selector: 'as-card-response',
  templateUrl: './card-response.component.html',
  styleUrls: ['./card-response.component.scss']
})
export class CardResponseComponent implements OnInit {

  botones: CardButton[] = []

  card: TarjetaModel = {name:''}
  private _Card : BehaviorSubject<TarjetaModel> = new BehaviorSubject(this.card);
  @Input() set Card(card: TarjetaModel) { this._Card.next(card); }
  get Card() { return this._Card.getValue()}


  @Output() cardSelected = new EventEmitter<TarjetaModel>();
  constructor (
    public agenteS: CurrentAgentService,
    public cards: TarjetasService
  ) { }

  ngOnInit(): void {
    this._Card.pipe(
      distinctUntilKeyChanged('name')
    ).subscribe( card => {
      this.card = card
    } )
  }

  async emitCard( change: MatSelectChange ) {
    const cardList = await this.cards.get()
    let tarjetaSelected = cardList.find( t => t.name == change.value )
    console.log(tarjetaSelected);
    this.cardSelected.emit(tarjetaSelected)
  }

}
