import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class BuzzService {
  private messageSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  private usersSubject: BehaviorSubject<
    { id: string; name: string; isHost: boolean }[]
  > = new BehaviorSubject<{ id: string; name: string; isHost: boolean }[]>([]);
  private buzzerEventsSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  private roomSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  private notificationSubject: Subject<string> = new Subject<string>();

  public message$: Observable<string> = this.messageSubject.asObservable();
  public users$: Observable<{ id: string; name: string; isHost: boolean }[]> =
    this.usersSubject.asObservable();
  public buzzerEvents$: Observable<any[]> =
    this.buzzerEventsSubject.asObservable();
  public room$: Observable<string> = this.roomSubject.asObservable();
  public notification$: Observable<string> =
    this.notificationSubject.asObservable();

  socket = io('http://localhost:3000');

  constructor() {
    this.socket.on('message', (message: string) => {
      this.messageSubject.next(message);
    });

    // Expecting an array of user objects
    this.socket.on(
      'users',
      (users: { id: string; name: string; isHost: boolean }[]) => {
        this.usersSubject.next(users);
      }
    );

    this.socket.on('buzzer', (event: any) => {
      const events = this.buzzerEventsSubject.value;
      this.buzzerEventsSubject.next([...events, event]);
    });

    this.socket.on('roomCreated', (roomId: string) => {
      this.roomSubject.next(roomId);
    });

    this.socket.on('notification', (notification: string) => {
      this.notificationSubject.next(notification);
    });
  }

  public sendMessage(message: any) {
    this.socket.emit('message', message);
  }

  public createRoom() {
    this.socket.emit('createRoom');
  }

  public joinRoom(roomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', roomId, (success: boolean) => {
        if (success) {
          resolve(success);
        } else {
          reject('Failed to join room');
        }
      });
    });
  }

  public pressBuzzer() {
    this.socket.emit('buzzer');
  }

  public setName(name: string) {
    this.socket.emit('setName', name);
  }

  public getNewMessage(): Observable<string> {
    return this.message$;
  }

  public getUsers(): Observable<
    { id: string; name: string; isHost: boolean }[]
  > {
    return this.users$;
  }

  public getBuzzerEvents(): Observable<any[]> {
    return this.buzzerEvents$;
  }

  public getRoom(): Observable<string> {
    return this.room$;
  }

  public getNotifications(): Observable<string> {
    return this.notification$;
  }
}
