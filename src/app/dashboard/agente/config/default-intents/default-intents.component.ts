import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentConfigService } from 'src/app/services/agent-config.service';
import { FallbackComponent } from '../fallback/fallback.component';

@Component({
  selector: 'as-default-intents',
  templateUrl: './default-intents.component.html',
  styleUrls: ['./default-intents.component.scss']
})
export class DefaultIntentsComponent implements OnInit {

  constructor (
    public opciones_: AgentConfigService,
    private _dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openConfigFallback() {
    var dialog = this._dialog.open(FallbackComponent, {
      width: '33%'
    })
  }

}
