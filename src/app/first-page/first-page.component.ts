import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-first-page',
  templateUrl: './first-page.component.html',
  styleUrls: ['./first-page.component.css'],
})
export class FirstPageComponent {
  audioPath = 'assets/Addict.mp3';
  private audio: HTMLAudioElement;
  constructor(private router: Router) {
    this.audio = new Audio(this.audioPath);
    this.audio.loop = true;
    setTimeout(() => {
      this.audio.pause();
      this.audio.currentTime = 0;
    }, 10000);
  }
  ngOnInit(): void {
    console.log('firstpage init');
  }
  playAudio(): void {
    this.audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  }
  navigateToApp() {
    this.router.navigate(['/buzz']);
    // const audio = new Audio(this.audioPath);
    // audio.play();
    // audio.loop = true;
    // setTimeout(() => {
    //     audio.pause();
    //     audio.currentTime = 0;
    //   }, 10000);
  }
}
