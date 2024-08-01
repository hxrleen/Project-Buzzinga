import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rounds-modal',
  templateUrl: './rounds-modal.component.html',
  styleUrls: ['./rounds-modal.component.css'],
})
export class RoundsModalComponent {
  @Output() roundsEntered = new EventEmitter<number>();
  showModal: boolean = true;
  rounds: number = 1;

  saveRounds() {
    if (this.rounds > 0) {
      this.roundsEntered.emit(this.rounds);
      this.showModal = false;
    } else {
      alert('Please enter a valid number of rounds.');
    }
  }
}
