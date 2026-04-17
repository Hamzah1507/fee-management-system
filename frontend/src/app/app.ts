import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './components/layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import {
  trigger, transition, style, animate, query, group
} from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('routeAnimation', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({ position: 'absolute', width: '100%', top: 0, left: 0 })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('300ms cubic-bezier(0.4,0,0.2,1)',
              style({ opacity: 0, transform: 'translateX(-20px)' }))
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0, transform: 'translateX(20px)' }),
            animate('300ms cubic-bezier(0.4,0,0.2,1)',
              style({ opacity: 1, transform: 'translateX(0)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class App {

  constructor(private router: Router) {}

  showSidebar(): boolean {
    const hiddenRoutes = ['/', '/register'];
    return !hiddenRoutes.includes(this.router.url);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData;
  }
}