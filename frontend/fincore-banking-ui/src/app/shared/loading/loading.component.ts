import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {

  // Stores the loader state.
  loading$: Observable<boolean>;

  constructor(
    private loadingService: LoadingService
  ) {
    // Gets the loader state after service initialization.
    this.loading$ = this.loadingService.loading$;
  }

}