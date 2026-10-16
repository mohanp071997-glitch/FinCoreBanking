
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ReviewerService } from '../../../services/reviewer.service';
import { ReviewActivityResponse } from '../../../interfaces/ReviewActivityResponse.interface';

@Component({
  selector: 'app-review-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-activities.component.html',
  styleUrl: './review-activities.component.css'
})
export class ReviewActivitiesComponent implements OnInit {
  activities: ReviewActivityResponse[] = [];

  isLoading = false;
  apiError = '';

  searchText = '';
  selectedDecision = 'All';
  selectedDateRange = '30';

  currentPage = 1;
  pageSize = 10;

  constructor(
    private readonly reviewerService: ReviewerService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  // Load actual review history from the backend API.
  loadActivities(): void {
    this.isLoading = true;
    this.apiError = '';

    this.reviewerService.getReviewActivities()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: response => {
          this.activities = [...response].sort((a, b) => {
            const dateA = new Date(a.reviewedAtUtc).getTime();
            const dateB = new Date(b.reviewedAtUtc).getTime();

            return (
              (Number.isNaN(dateB) ? 0 : dateB) -
              (Number.isNaN(dateA) ? 0 : dateA)
            );
          });

          this.currentPage = 1;
        },
        error: error => {
          console.error('Failed to load review activities:', error);
          this.apiError =
            'Unable to load review activity. Please try again.';
        }
      });
  }

  // Search, decision and date filters.
  get filteredActivities(): ReviewActivityResponse[] {
    const term = this.searchText.trim().toLowerCase();
    const now = new Date();

    return this.activities.filter(activity => {
      const requestId =
        (activity.applicationRequestId ?? '').toLowerCase();

      const customerName =
        (activity.customerName ?? '').toLowerCase();

      const email = (activity.email ?? '').toLowerCase();

      const matchesSearch =
        !term ||
        requestId.includes(term) ||
        customerName.includes(term) ||
        email.includes(term);

      const matchesDecision =
        this.selectedDecision === 'All' ||
        activity.reviewDecision === this.selectedDecision;

      let matchesDate = true;

      if (this.selectedDateRange !== 'All') {
        const days = Number(this.selectedDateRange);
        const reviewedDate = new Date(activity.reviewedAtUtc);
        const cutoff = new Date(now);

        cutoff.setDate(cutoff.getDate() - days);

        matchesDate =
          !Number.isNaN(reviewedDate.getTime()) &&
          reviewedDate >= cutoff &&
          reviewedDate <= now;
      }

      return matchesSearch && matchesDecision && matchesDate;
    });
  }

  // Summary cards use the complete loaded history.
  get totalCount(): number {
    return this.filteredActivities.length;
  }

  get verifiedCount(): number {
    return this.filteredActivities.filter(
      item => item.reviewDecision === 'Verified'
    ).length;
  }

  get rejectedCount(): number {
    return this.filteredActivities.filter(
      item => item.reviewDecision === 'Rejected'
    ).length;
  }

  // Pagination.
  get pagedActivities(): ReviewActivityResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredActivities.slice(
      start,
      start + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.totalCount / this.pageSize)
    );
  }

  get pageStart(): number {
    return this.totalCount === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.totalCount
    );
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number | string): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedDecision = 'All';
    this.selectedDateRange = '30';
    this.currentPage = 1;
  }

  // Return to the reviewer dashboard.
  goBackToDashboard(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/reviewer']);
    }
  }

  trackByActivity(
    index: number,
    activity: ReviewActivityResponse
  ): string {
    return `${activity.accountOpeningApplicationId}-${activity.reviewedAtUtc}-${index}`;
  }

    viewApplication(id: number): void {
    this.router.navigate(['/reviewer/application', id]);
  }
}
