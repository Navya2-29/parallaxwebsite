import { Component } from '@angular/core';
import { RoomRevealComponent } from './room-reveal/room-reveal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RoomRevealComponent],
  template: `<app-room-reveal></app-room-reveal>`,
})
export class AppComponent {}
