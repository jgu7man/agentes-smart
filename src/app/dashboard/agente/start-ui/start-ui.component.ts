import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MxAlert, MxCache } from '@marxa/devkit';
import { CurrentAgentService } from 'src/app/services/current-agent.service';

@Component({
  templateUrl: './start-ui.component.html',
  styleUrls: ['./start-ui.component.scss'],
})
export class StartUiComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    public currentAgent: CurrentAgentService
  ) {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
  }

  ngOnInit() {}
}
