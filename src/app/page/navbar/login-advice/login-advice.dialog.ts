import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './login-advice.dialog.html',
  styleUrls: ['./login-advice.dialog.scss']
})
export class LoginAdviceDialog {

  constructor(
    public dialogRef: MatDialogRef<LoginAdviceDialog>,
    ) {}

   onClick(): void {
     this.dialogRef.close();
   }

}
