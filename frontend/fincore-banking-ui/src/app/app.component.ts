import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { LoadingComponent } from './shared/loading/loading.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingComponent,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'fincore-banking-ui';

  showPublicHeader = false;

  constructor(private router: Router) {}

  ngOnInit(): void {

    this.updatePublicLayout(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePublicLayout(event.urlAfterRedirects);
      });
  }

  // Shows the public header and footer only on public pages.
  private updatePublicLayout(url: string): void {

    const currentUrl = url.split('?')[0];

    const publicPages = [
      '/',
      '/nri'
    ];

    this.showPublicHeader = publicPages.includes(currentUrl);
  }
}