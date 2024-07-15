import { Component, OnInit, OnDestroy } from '@angular/core';
import { BuzzService } from '../buzz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-buzz',
  templateUrl: './buzz.component.html',
  styleUrls: ['./buzz.component.css']
})
export class BuzzComponent implements OnInit, OnDestroy {
  newMessage = '';
  messageList: string[] = [];
  users: { id: string; name: string; isHost: boolean }[] = [];
  buzzerEvents: any[] = [];
  userName = '';
  roomId = '';
  notifications: string[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private buzzService: BuzzService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Room ID from URL
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        const roomIdFromRoute = params.get('roomId');
        if (roomIdFromRoute) {
          this.roomId = roomIdFromRoute;
          this.joinRoom();
        }
      })
    );

    // Subscribe to message stream
    this.subscriptions.push(
      this.buzzService.getNewMessage().subscribe(message => {
        this.messageList.push(message);
      })
    );

    // Subscribe to users stream
    this.subscriptions.push(
      this.buzzService.getUsers().subscribe(users => {
        this.users = users;
      })
    );

    // Subscribe to buzzer events stream
    this.subscriptions.push(
      this.buzzService.getBuzzerEvents().subscribe(events => {
        this.buzzerEvents = events;
      })
    );

    // Subscribe to room changes
    this.subscriptions.push(
      this.buzzService.getRoom().subscribe(roomId => {
        if (roomId) {
          this.roomId = roomId;
          if (this.route.snapshot.paramMap.get('roomId') !== roomId) {
            this.router.navigate(['buzz', 'room', roomId]);
          }
        }
      })
    );

    // Subscribe to notifications
    this.subscriptions.push(
      this.buzzService.getNotifications().subscribe(notification => {
        if (!this.notifications.includes(notification)) {
          alert(notification);
        }
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  sendMessage() {
    this.buzzService.sendMessage(this.newMessage);
    this.newMessage = '';
  }

  pressBuzzer() {
    this.buzzService.pressBuzzer();
  }

  setName() {
    if (this.userName.trim()) {
      this.buzzService.setName(this.userName);
    }
  }

  createRoom() {
    this.buzzService.createRoom();
  }

  joinRoom() {
    if (this.roomId.trim()) {
      this.buzzService.joinRoom(this.roomId).then(success => {
        if (success) {
          this.router.navigate(['buzz', 'room', this.roomId]);
        } else {
          console.log("Failed to join the room");
        }
      }).catch(err => {
        console.error(err);
      });
    }
  }
}
