import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  username: string;
  smsToken: string;
}

@Component({
  selector: 'app-sms-token-dialog',
  templateUrl: './sms-token-dialog.component.html',
  styleUrls: ['./sms-token-dialog.component.scss', '../../app.component.scss']
})
export class SmsTokenDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SmsTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}