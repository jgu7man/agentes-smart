import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { iAgentInteraction } from 'src/app/models/interactions.model';
import { InteractionsService } from 'src/app/services/interactions.service';

@Component({
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.scss'],
})
export class InteractionsComponent implements OnInit {
  interactions: iAgentInteraction[] = [];

  constructor(
    public _interactions: InteractionsService,
    public _router: Router
  ) {}

  async ngOnInit() {
    this.interactions = await this._interactions.list();
  }

  saveAsTrainingPhrase(
    convId: string,
    intentId: string,
    text: string,
    index: number
  ) {
    this._interactions.addTraningPhrase(intentId, text, convId).then(() => {
      this.interactions[index]['checked'] = true;
    });
  }

  setChecked(interId: string, index: number) {
    this._interactions.setChecked(interId).then(() => {
      this.interactions[index]['checked'] = true;
    });
  }

  delete(convId: string, index: number, event: any): void {
    event.stopPropagation();
    this._interactions.delete(convId).then(async () => {
      this.interactions.splice(index, 1);
    });
  }
}
