import { Component, OnInit } from '@angular/core';
import { ContextsService } from 'src/app/services/contexts.service';

@Component({
  templateUrl: './intents.component.html',
  styleUrls: ['./intents.component.scss']
})
export class IntentsComponent implements OnInit {

  constructor(
    public contexts: ContextsService
  ) { }

  ngOnInit(): void {
  }

}
