import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  // Stores the current loader state.
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Exposes the loader state to the UI.
  loading$ = this.loadingSubject.asObservable();

  // Shows the loader.
  show(): void {
    this.loadingSubject.next(true);
  }

  // Hides the loader.
  hide(): void {
    this.loadingSubject.next(false);
  }
}