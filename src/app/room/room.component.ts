import { Component, OnInit } from '@angular/core';
import { BuzzService } from '../buzz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  users: { id: string; name: string; isHost: boolean }[] = [];
  buzzerEvents: any[] = [];
  userName = '';
  roomId: string | null = null;
  notifications: string[] = [];
  audioPath = 'assets/chintapak.mp3';
  isCurrentUserHost = false;
  gameRounds: number | null = null;

  timer: number = 30;
  isTimerRunning: boolean = false;
  hasPressedBuzzer: boolean = false;
  currentRound: number = 1;


  
  constructor(
    private buzzService: BuzzService,
    private route: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard
    
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId');
      if (this.roomId) {
        this.buzzService
          .joinRoom(this.roomId)
          .then((success) => {
            if (!success) {
              console.log('Failed to join the room');
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });

    this.buzzService.getTimer().subscribe((time) => {
      this.timer = time;
      this.isTimerRunning = time > 0;
      if (!this.isTimerRunning) {
        this.hasPressedBuzzer = false; // Reset buzzer press state when timer stops
      }
    });
    

    this.buzzService
      .getUsers()
      .subscribe((users: { id: string; name: string; isHost: boolean }[]) => {
        this.users = users;
        const currentUser = users.find(
          (user) => user.id === this.buzzService.socket.id
        );
        this.isCurrentUserHost = currentUser ? currentUser.isHost : false;
      });

    this.buzzService.getBuzzerEvents().subscribe((events: any[]) => {
      this.buzzerEvents = events;
    });

    this.buzzService.getNotifications().subscribe((notification: string) => {
      this.notifications.push(notification);
    });

    this.buzzService.getTimerEnd().subscribe(() => {
      this.isTimerRunning = false;
    });


    this.buzzService.getRound().subscribe((round: number) => {
      this.currentRound = round;
    });


  }

  // pressBuzzer() {
  //   this.buzzService.pressBuzzer();
  //   const audio = new Audio(this.audioPath);
  //   audio.play();
  //   audio.loop = true;
  //   setTimeout(() => {
  //     audio.pause();
  //     audio.currentTime = 0;
  //   }, 3000);
  // }

  pressBuzzer() {
    if (this.isTimerRunning && !this.hasPressedBuzzer) {
      this.buzzService.pressBuzzer();
      this.hasPressedBuzzer = true; // Mark buzzer as pressed
      const audio = new Audio(this.audioPath);
      audio.play();
      audio.loop = true;
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 3000);
    }
  }

  setName() {
    if (this.userName.trim()) {
      this.buzzService.setName(this.userName);
    }
  }

  copyRoomId() {
    if (this.roomId) {
      this.clipboard.copy(this.roomId);
      alert('Room ID copied to clipboard!');
    } else {
      alert('Room ID is not available.');
    }
  }

  startTimer() {
    if (this.roomId) {
      this.isTimerRunning = true;
      this.buzzService.startTimer(this.roomId);
    }
  }

  leaveRoom() {
    const currentUser = this.users.find(
      (user) => user.id === this.buzzService.socket.id
    );

    if (currentUser?.isHost) {
      alert(
        `${currentUser.name}, you are the host. You cannot leave the room without closing it.`
      );
      if (confirm('Do you want to close the room?')) {
        this.buzzService.closeRoom();
        this.router.navigate(['buzz']);
      }
    } else {
      if (confirm('Do you really want to leave the room?')) {
        this.router.navigate(['buzz']);

        this.buzzService.leaveRoom().then(() => {
          this.router.navigate(['buzz']);
        });
      }
    }
  }

  setGameRounds(rounds: number) {
    this.gameRounds = rounds;
    console.log(`Game rounds set to: ${this.gameRounds}`);
  }
}
