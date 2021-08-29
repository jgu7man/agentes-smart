import { Inject, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MxText } from '@marxa/devkit';
import { AddContextComponent } from './add-context.component';

@Component({
  templateUrl: './add-context.dialog.html',
  styleUrls: ['./add-context.dialog.scss'],
})
export class AddContextDialog implements OnInit {

  contextName: string = ''
   @ViewChild(AddContextComponent) component!: AddContextComponent
  constructor (
    @Inject(MAT_DIALOG_DATA) public contextIndex: number,
    public dialog_: MatDialogRef<AddContextDialog>,
    public _text: MxText
  ) { }

  ngOnInit(): void {
  }


  async onSave(contextName: string) {
    this.dialog_.close(contextName);
  }
}
