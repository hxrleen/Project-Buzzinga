import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

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
  private roomConfigSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  public message$: Observable<string> = this.messageSubject.asObservable();
  public users$: Observable<{ id: string; name: string; isHost: boolean }[]> =
    this.usersSubject.asObservable();
  public buzzerEvents$: Observable<any[]> =
    this.buzzerEventsSubject.asObservable();
  public room$: Observable<string> = this.roomSubject.asObservable();
  public notification$: Observable<string> =
    this.notificationSubject.asObservable();
  public roomConfig$: Observable<string> =
    this.roomConfigSubject.asObservable();

  private timerSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  public timer$: Observable<number> = this.timerSubject.asObservable();

  private timerEndSubject: Subject<void> = new Subject<void>();
  public timerEnd$: Observable<void> = this.timerEndSubject.asObservable();
  private currentRoomId: string | null = null; // Store the current room ID

  public socket: Socket = io('http://localhost:3000');

  constructor() {
    this.socket.on('message', (message: string) => {
      this.messageSubject.next(message);
    });

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

    this.socket.on('roomCreated', (roomId: string, config: string) => {
      this.roomSubject.next(roomId);
      this.roomConfigSubject.next(config);
    });

    this.socket.on('notification', (notification: string) => {
      this.notificationSubject.next(notification);
    });

    this.socket.on('hostLeaveRoomAttempt', (message: string) => {
      alert(message);
    });

    this.socket.on('roomClosed', (message: string) => {
      alert(message);
      window.location.href = '/buzz';
    });

    this.socket.on(
      'currentState',
      (state: {
        users: { id: string; name: string; isHost: boolean }[];
        buzzerEvents: any[];
      }) => {
        this.usersSubject.next(state.users);
        this.buzzerEventsSubject.next(state.buzzerEvents);
      }
    );

    // this.socket.on('startTimer', (duration: number, roomId: string) => {
    //   this.startClientTimer(duration, roomId);
    // });

    this.socket.on('startTimer', (duration: number) => {
      this.startClientTimer(duration);
    });

    this.socket.on('timerEnded', () => {
      this.timerSubject.next(0); // Reset the timer
    });
  }

  public sendMessage(message: string): void {
    this.socket.emit('message', message);
  }

  public createRoom(buzzMode: 'single' | 'multiple'): void {
    this.socket.emit('createRoom', buzzMode);
  }

  public pressBuzzer(): void {
    this.socket.emit('buzzer');
  }

  public setName(name: string): void {
    this.socket.emit('setName', name);
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

  public getRoomConfig(): Observable<string> {
    return this.roomConfig$;
  }

  public leaveRoom(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('leaveRoom', (response: string) => {
        if (response === 'success') {
          resolve();
        } else {
          reject('Failed to leave room');
        }
      });
    });
  }

  public closeRoom(): void {
    this.socket.emit('closeRoom');
  }

  public startTimer(roomId: string): void {
    this.socket.emit('startTimer', roomId);
  }

  private startClientTimer(duration: number): void {
    let remainingTime = duration;
    this.timerSubject.next(remainingTime);
    const interval = setInterval(() => {
      remainingTime -= 1;
      this.timerSubject.next(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(interval);
        this.socket.emit('timerEnded');
      }
    }, 1000);
  }

  public endEvent(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('endEvent');
      resolve();
    });
  }

  public getNewMessage(): Observable<string> {
    return this.message$;
  }

  public isValidRoom(roomId: string): Observable<boolean> {
    const isValid = !!roomId && roomId.length > 3;
    return of(isValid);
  }

  // private startClientTimer(duration: number, roomId: string): void {
  //   let remainingTime = duration;
  //   this.timerSubject.next(remainingTime);
  //   const interval = setInterval(() => {
  //     remainingTime -= 1;
  //     this.timerSubject.next(remainingTime);
  //     if (remainingTime <= 0) {
  //       clearInterval(interval);
  //       this.socket.emit('timerEnded', roomId);
  //     }
  //   }, 1000);
  // }

  public joinRoom(roomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', roomId, (success: boolean) => {
        if (success) {
          this.currentRoomId = roomId; // Store the room ID
          resolve(success);
        } else {
          reject('Failed to join room');
        }
      });
    });
  }

  // public joinRoom(roomId: string): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     this.socket.emit('joinRoom', roomId, (response: { success: boolean }) => {
  //       if (response.success) {
  //         resolve(true);
  //       } else {
  //         resolve(false);
  //       }
  //     });
  //   });
  // }

  public getTimer(): Observable<number> {
    return this.timer$;
  }

  public getTimerEnd(): Observable<void> {
    return this.timerEnd$;
  }

  public setGameRounds(rounds: number): void {
    this.socket.emit('setGameRounds', rounds);
  }
}
