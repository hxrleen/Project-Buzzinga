import { Component, OnInit } from '@angular/core';
import { BuzzService } from '../buzz.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-buzz',
  templateUrl: './buzz.component.html',
  styleUrls: ['./buzz.component.css']
})
export class BuzzComponent implements OnInit {
  newMessage = '';
  messageList: string[] = [];
  users: { id: string; name: string; isHost: boolean }[] = [];
  buzzerEvents: any[] = [];
  userName = '';
  roomId = '';

  constructor(
    private buzzService: BuzzService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const roomIdFromRoute = params.get('roomId');
      if (roomIdFromRoute) {
        this.roomId = roomIdFromRoute;
        this.buzzService.joinRoom(this.roomId).then(success => {
          if (success) {
            console.log("Successfully joined the room", this.roomId);
          } else {
            console.log("Failed to join the room");
          }
        }).catch(err => {
          console.error(err);
        });
      }
    });

    this.buzzService.getNewMessage().subscribe((message: string) => {
      this.messageList.push(message);
    });

    this.buzzService.getUsers().subscribe((users: { id: string; name: string; isHost: boolean }[]) => {
      console.log('updated users:', users); 
      this.users = users;
    });

    this.buzzService.getBuzzerEvents().subscribe((events: any[]) => {
      this.buzzerEvents = events;
    });

    this.buzzService.getRoom().subscribe((roomId: string) => {
      this.roomId = roomId;
      if (this.route.snapshot.paramMap.get('roomId') !== roomId) {
        if(roomId){
          this.router.navigate(['buzz','room',roomId]);
        }
      }
    });

    this.buzzService.getNotifications().subscribe(notification => {
      alert(notification); 
    });
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
          this.router.navigate(['buzz','room',this.roomId]);
        } else {
          console.log("Failed to join the room");
        }
      }).catch(err => {
        console.error(err);
      });
    }
  }
}
