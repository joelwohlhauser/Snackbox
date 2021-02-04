import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  imageURL: string;
}

@Component({
  selector: 'change-image-dialog',
  templateUrl: './change-image-dialog.component.html',
  styleUrls: ['./change-image-dialog.component.scss', '../../app.component.scss']
})
export class ChangeImageDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ChangeImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}