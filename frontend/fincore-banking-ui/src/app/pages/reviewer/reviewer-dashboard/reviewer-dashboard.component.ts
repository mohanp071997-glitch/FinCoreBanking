import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { ApplicationDetails, PendingApplication, ReviewerService, SubmitReviewRequest, SubmitReviewResponse } from '../../../services/reviewer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { AppNotification, NotificationService } from '../../../services/notification.service';
import { ReviewDashboardStatistics } from '../../../interfaces/ReviewDashboardStatistics.interface';


// FEATURE: Application status and sorting models.
type ApplicationStatus = 'Pending Review' | 'Verified' | 'Rejected';

type SortField =
  | 'requestId'
  | 'customerName'
  | 'accountType'
  | 'applicationDate'
  | 'documentsVerified'
  | 'status';

// FEATURE: Dashboard application model.
interface ReviewApplication {
  id: number;
  requestId: string;
  customerName: string;
  email: string;
  mobile: string;
  accountType: string;
  applicationDate: string;
  applicationTime: string;
  sortDate: string;
  documentsVerified: number;
  totalDocuments: number;
  status: ApplicationStatus;
  comments?: string;
}

// FEATURE: Review activity model.
interface ReviewActivity {
  title: string;
  requestId: string;
  customerName: string;
  timeAgo: string;
  type: 'verified' | 'rejected';
}

@Component({
  selector: 'app-reviewer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewer-dashboard.component.html',
  styleUrl: './reviewer-dashboard.component.css'
})
export class ReviewerDashboardComponent implements OnInit {

  constructor(
    private readonly reviewerService: ReviewerService,private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  // FEATURE: Dashboard header and reviewer profile.
  today = new Date();
  // FEATURE: Dynamic reviewer profile
  reviewerName = '';
  reviewerRole = 'Application Reviewer';
  reviewerInitials = 'AR';

  // FEATURE: Sidebar navigation.
  activeMenu = 'Dashboard';
  applicationsMenuExpanded = true;

  // FEATURE: Header interactions.
  globalSearch = '';
  showNotifications = false;
  showProfileMenu = false;
  notificationCount = 0;

  // FEATURE: API loading and error state.
  isLoading = false;
  isSubmittingReview = false;
  apiError = '';

  // FEATURE: Application filters.
  activeTab = 'All Applications';
  selectedAccountType = 'All Types';
  selectedDateRange = 'Last 30 Days';
  selectedStatus = 'All Status';

  // FEATURE: Pagination.
  currentPage = 1;
  pageSize = 5;

  // FEATURE: Sorting.
  sortField: SortField = 'applicationDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // FEATURE: Review dialog state.
  showReviewModal = false;
  selectedApplication: ReviewApplication | null = null;
  selectedApplicationDetails: ApplicationDetails | null = null;

  reviewDecision: 'Verified' | 'Rejected' = 'Verified';
  reviewComments = '';

  // FEATURE: Verification checklist.
  personalDetailsVerified = false;
  identityDocumentVerified = false;
  addressDocumentVerified = false;
  applicantPhotoVerified = false;

  // FEATURE: Detail loading state.
  isLoadingDetails = false;

  // FEATURE: Toast messages.
  toastMessage = '';
  toastType: 'success' | 'info' = 'info';

  // FEATURE: Selected application IDs.
  selectedIds: number[] = [];

  // FEATURE: Applications loaded from the backend API.
  applications: ReviewApplication[] = [];

  
  // Actual activity history API is not currently provided.
  activities: ReviewActivity[] = [];


  // FEATURE: Application notification state
  notifications: AppNotification[] = [];
  private notificationSubscription?: Subscription;

  
  averageReviewTimeMinutes: number | null = null;

    dashboardStatistics: ReviewDashboardStatistics = {
    pendingCount: 0,
    verifiedTodayCount: 0,
    rejectedTodayCount: 0,
    averageReviewTimeMinutes: null
  };


  // FEATURE: Load pending applications when the page opens.
  ngOnInit(): void {
    this.loadReviewerProfile();
    this.loadApplications();
    this.loadNotificationCount();
    this.loadNotifications();
    this.startSignalRNotifications();
    this.loadDashboardStatistics();
  }

    private loadNotificationCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: response => {
        this.notificationCount = response.unreadCount;
      },
      error: error => {
        console.error('Failed to load unread count:', error);
      }
    });
  }

    private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: response => {
        this.notifications = response as any;
      },
      error: error => {
        console.error('Failed to load notifications:', error);
      }
    });
  }

  // FEATURE: Load applications from the .NET API.
  loadApplications(): void {
    this.isLoading = true;
    this.apiError = '';

    this.reviewerService.getPendingApplications()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: PendingApplication[]) => {
          this.applications = response.map(item => {
            const submittedDate = new Date(item.submittedAt);
            const dateIsValid =
              !Number.isNaN(submittedDate.getTime());

            return {
              id: item.accountOpeningApplicationId,
              requestId: item.applicationRequestId,
              customerName: item.email,
              email: item.email,
              mobile: '',
              accountType: 'Account Application',
              applicationDate: dateIsValid
                ? submittedDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : '',
              applicationTime: dateIsValid
                ? submittedDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '',
              sortDate: dateIsValid
                ? submittedDate.toISOString()
                : '',
              documentsVerified: 0,
              totalDocuments: 4,
              status: 'Pending Review' as ApplicationStatus
            };
          });

          this.currentPage = 1;
          this.selectedIds = [];
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to load applications:', error);

          this.apiError =
            'Unable to load applications. Please try again.';

          this.showToast(this.apiError, 'info');
        }
      });
  }

  // FEATURE: Application count statistics.
  get totalCount(): number {
    return this.applications.length;
  }

  get pendingCount(): number {
    return this.applications.filter(
      app => app.status === 'Pending Review'
    ).length;
  }

  get verifiedCount(): number {
    return this.applications.filter(
      app => app.status === 'Verified'
    ).length;
  }

  get rejectedCount(): number {
    return this.applications.filter(
      app => app.status === 'Rejected'
    ).length;
  }

  // FEATURE: Document verification summary.
  get verifiedDocumentCount(): number {
    return this.applications.reduce(
      (total, app) => total + app.documentsVerified,
      0
    );
  }

  get totalDocumentCount(): number {
    return this.applications.reduce(
      (total, app) => total + app.totalDocuments,
      0
    );
  }

  get documentPercentage(): number {
    if (this.totalDocumentCount === 0) {
      return 0;
    }

    return Math.round(
      (this.verifiedDocumentCount / this.totalDocumentCount) * 100
    );
  }

  // FEATURE: Search, account type, date and status filtering.
  get filteredApplications(): ReviewApplication[] {
    const term = this.globalSearch.trim().toLowerCase();

    return this.applications
      .filter(app => {
        const matchesSearch =
          !term ||
          app.requestId.toLowerCase().includes(term) ||
          app.customerName.toLowerCase().includes(term) ||
          app.email.toLowerCase().includes(term) ||
          app.mobile.includes(term);

        const matchesType =
          this.selectedAccountType === 'All Types' ||
          app.accountType === this.selectedAccountType;

        const matchesTab =
          this.activeTab === 'All Applications' ||
          app.status === this.activeTab;

        const matchesStatus =
          this.selectedStatus === 'All Status' ||
          app.status === this.selectedStatus;

        const applicationDate = new Date(app.sortDate);
        const now = new Date();

        let matchesDate = true;

        if (this.selectedDateRange === 'Today') {
          matchesDate =
            app.sortDate !== '' &&
            applicationDate.toDateString() === now.toDateString();
        } else if (this.selectedDateRange === 'Last 7 Days') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);

          matchesDate =
            app.sortDate !== '' &&
            applicationDate >= cutoff &&
            applicationDate <= now;
        } else if (this.selectedDateRange === 'Last 30 Days') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 30);

          matchesDate =
            app.sortDate !== '' &&
            applicationDate >= cutoff &&
            applicationDate <= now;
        }

        return (
          matchesSearch &&
          matchesType &&
          matchesTab &&
          matchesStatus &&
          matchesDate
        );
      })
      .sort((a, b) => {
        let result = 0;

        if (this.sortField === 'documentsVerified') {
          result = a.documentsVerified - b.documentsVerified;
        } else if (this.sortField === 'applicationDate') {
          result = a.sortDate.localeCompare(b.sortDate);
        } else {
          result = String(a[this.sortField]).localeCompare(
            String(b[this.sortField])
          );
        }

        return this.sortDirection === 'asc' ? result : -result;
      });
  }

  // FEATURE: Pagination data.
  get pagedApplications(): ReviewApplication[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredApplications.slice(
      start,
      start + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredApplications.length / this.pageSize)
    );
  }

  get pageStart(): number {
    return this.filteredApplications.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredApplications.length
    );
  }

  get allVisibleSelected(): boolean {
    return (
      this.pagedApplications.length > 0 &&
      this.pagedApplications.every(app =>
        this.selectedIds.includes(app.id)
      )
    );
  }

  // FEATURE: Search/filter updates reset pagination.
  onFilterChange(): void {
    this.currentPage = 1;
  }

  // FEATURE: Select dashboard application tab.
  setTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  // FEATURE: Sidebar navigation selection.
  setMenu(menu: string): void {
    this.activeMenu = menu;

    switch (menu) {
      case 'Dashboard':
      case 'Account Applications':
        this.activeTab = 'All Applications';
        this.selectedStatus = 'All Status';
        break;

      case 'Pending Review':
        this.activeTab = 'Pending Review';
        this.selectedStatus = 'All Status';
        break;

      case 'Verified Applications':
        this.activeTab = 'Verified';
        this.selectedStatus = 'All Status';
        break;

      case 'Rejected Applications':
        this.activeTab = 'Rejected';
        this.selectedStatus = 'All Status';
        break;

      case 'Reports & Analytics':
        this.showToast(
          'Reports & Analytics page route can be connected here.',
          'info'
        );
        break;

      case 'Audit Trail':
        this.showToast(
          'Audit Trail page route can be connected here.',
          'info'
        );
        break;
    }

    this.currentPage = 1;
  }

  // FEATURE: Reset all filters.
  resetFilters(): void {
    this.globalSearch = '';
    this.selectedAccountType = 'All Types';
    this.selectedDateRange = 'Last 30 Days';
    this.selectedStatus = 'All Status';
    this.activeTab = 'All Applications';
    this.currentPage = 1;
    this.selectedIds = [];
  }

  // FEATURE: Table sorting.
  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  // FEATURE: Navigate through pages.
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
  }

  // FEATURE: Select or deselect visible applications.
  toggleVisible(checked: boolean): void {
    const visibleIds = this.pagedApplications.map(app => app.id);

    if (checked) {
      this.selectedIds = Array.from(
        new Set([...this.selectedIds, ...visibleIds])
      );
    } else {
      this.selectedIds = this.selectedIds.filter(
        id => !visibleIds.includes(id)
      );
    }
  }

  toggleOne(id: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedIds.includes(id)) {
        this.selectedIds = [...this.selectedIds, id];
      }
    } else {
      this.selectedIds = this.selectedIds.filter(
        selectedId => selectedId !== id
      );
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  // FEATURE: Open review dialog and load real application details.
  openReview(app: ReviewApplication): void {
    this.selectedApplication = app;
    this.selectedApplicationDetails = null;
    this.reviewDecision = 'Verified';
    this.reviewComments = '';

    this.personalDetailsVerified = false;
    this.identityDocumentVerified = false;
    this.addressDocumentVerified = false;
    this.applicantPhotoVerified = false;

    this.showReviewModal = true;
    this.isLoadingDetails = true;

    
    this.reviewerService.startReview(app.id).subscribe({
      next: (response) => {
        console.log('Review started:', response.reviewStartedAtUtc);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to start review:', error);
        this.showToast(
          'Unable to record review start time.',
          'info'
        );
      }
    });


    this.reviewerService.getApplicationDetails(app.id)
      .pipe(finalize(() => this.isLoadingDetails = false))
      .subscribe({
        next: (response: ApplicationDetails) => {
          this.selectedApplicationDetails = response;

          // FEATURE: Extract available applicant details defensively.
          const data = response.applicationData as any;
          const personal = data?.PersonalDetails
            ?? data?.personalDetails
            ?? data?.personal
            ?? {};

          const additional = data?.AdditionalDetails
            ?? data?.additionalDetails
            ?? {};

          const fullName =
            personal?.FullName ??
            personal?.fullName ??
            personal?.CustomerName ??
            personal?.customerName;

          const mobile =
            personal?.Mobile ??
            personal?.mobile ??
            personal?.PhoneNumber ??
            personal?.phoneNumber;

          const accountType =
            additional?.AccountType ??
            additional?.accountType ??
            data?.AccountType ??
            data?.accountType;

            

          if (fullName) {
            app.customerName = String(fullName);
          }

          if (mobile) {
            app.mobile = String(mobile);
          }

          if (accountType) {
            app.accountType = String(accountType);
          }

          app.email = response.email || app.email;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to load application details:', error);

          this.showToast(
            'Unable to load application details. Please try again.',
            'info'
          );
        }
      });
  }

  // FEATURE: Close review dialog.
  closeReview(): void {
    if (this.isSubmittingReview) {
      return;
    }

    this.showReviewModal = false;
    this.selectedApplication = null;
    this.selectedApplicationDetails = null;
    this.reviewComments = '';

    this.personalDetailsVerified = false;
    this.identityDocumentVerified = false;
    this.addressDocumentVerified = false;
    this.applicantPhotoVerified = false;
  }

  // FEATURE: Submit actual reviewer decision to the backend.
  submitReview(): void {
    const app = this.selectedApplication;

    if (!app) {
      return;
    }

    if (this.isSubmittingReview) {
      return;
    }

    if (app.status !== 'Pending Review') {
      this.showToast(
        'This application has already been reviewed.',
        'info'
      );
      return;
    }

    // FEATURE: All checklist items are required for verification.
    if (
      this.reviewDecision === 'Verified' &&
      !(
        this.personalDetailsVerified &&
        this.identityDocumentVerified &&
        this.addressDocumentVerified &&
        this.applicantPhotoVerified
      )
    ) {
      this.showToast(
        'Verify all four checklist items before confirming verification.',
        'info'
      );
      return;
    }

    // FEATURE: Rejection reason is mandatory.
    if (
      this.reviewDecision === 'Rejected' &&
      !this.reviewComments.trim()
    ) {
      this.showToast(
        'Enter a rejection reason before rejecting the application.',
        'info'
      );
      return;
    }

    // FEATURE: Prepare request matching the .NET API DTO.
    const request: SubmitReviewRequest = {
      reviewDecision: this.reviewDecision,
      personalDetailsVerified: this.personalDetailsVerified,
      identityDocumentVerified: this.identityDocumentVerified,
      addressDocumentVerified: this.addressDocumentVerified,
      applicantPhotoVerified: this.applicantPhotoVerified,
      comments: this.reviewComments.trim()
    };

    this.isSubmittingReview = true;

    this.reviewerService.submitReview(app.id, request)
      .pipe(finalize(() => this.isSubmittingReview = false))
      .subscribe({
        next: (response: SubmitReviewResponse) => {
          // FEATURE: Update UI after successful API response
          app.comments = this.reviewComments.trim();

          app.status =
            this.reviewDecision === 'Verified'
              ? 'Verified'
              : 'Rejected';

          if (this.reviewDecision === 'Verified') {
            app.documentsVerified = app.totalDocuments;
          }

          // FEATURE: Add recent activity
          this.activities.unshift({
            title:
              this.reviewDecision === 'Verified'
                ? 'Application verified'
                : 'Application rejected',
            requestId: app.requestId,
            customerName: app.customerName,
            timeAgo: 'Just now',
            type:
              this.reviewDecision === 'Verified'
                ? 'verified'
                : 'rejected'
          });

          // FEATURE: Show API response
          this.showToast(
            response.message ||
              `Application ${app.requestId} review saved successfully.`,
            'success'
          );

          // FEATURE: Close modal after successful submission
          this.showReviewModal = false;
          this.selectedApplication = null;
          this.selectedApplicationDetails = null;
          this.reviewComments = '';

          this.personalDetailsVerified = false;
          this.identityDocumentVerified = false;
          this.addressDocumentVerified = false;
          this.applicantPhotoVerified = false;

          // FEATURE: Refresh pending applications
          this.loadApplications();
          this.loadDashboardStatistics();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to submit review:', error);

          const message =
            error.error?.message ||
            (error.status === 409
              ? 'This application has already been reviewed.'
              : 'Unable to submit review. Please try again.');

          this.showToast(message, 'info');
        }
      });
  }

  // FEATURE: Export filtered applications as CSV.
  exportApplications(): void {
    const headers = [
      'Request ID',
      'Customer Name',
      'Email',
      'Mobile',
      'Account Type',
      'Application Date',
      'Documents Verified',
      'Total Documents',
      'Status',
      'Comments'
    ];

    const rows = this.filteredApplications.map(app => [
      app.requestId,
      app.customerName,
      app.email,
      app.mobile,
      app.accountType,
      app.applicationDate,
      app.documentsVerified,
      app.totalDocuments,
      app.status,
      app.comments ?? ''
    ]);

    const csv = [headers, ...rows]
      .map(row =>
        row
          .map(value =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'fincore-review-applications.csv';
    link.click();

    URL.revokeObjectURL(url);

    this.showToast(
      'CSV export generated successfully.',
      'success'
    );
  }

  // FEATURE: Display UI feedback.
  showToast(
    message: string,
    type: 'success' | 'info' = 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
  }


  // FEATURE: Load logged-in user profile
  private loadReviewerProfile(): void {
    const user = this.authService.getCurrentUser();

    this.reviewerName =
      user?.userName ||
      user?.name ||
      'Application Reviewer';

    const roles: string[] = Array.isArray(user?.roles)
      ? user.roles
      : user?.role
        ? [user.role]
        : [];

    this.reviewerRole = roles.some(
      role => role.toLowerCase() === 'reviewer'
    )
      ? 'Application Reviewer'
      : 'User';

    this.reviewerInitials = this.reviewerName
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }


  // FEATURE: Toggle notification dropdown
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  // FEATURE: Clear visible notification count
  clearNotificationCount(): void {
    this.notifications = [];
    this.notificationCount = 0;
  }

  // FEATURE: Open the selected application from a notification
  openNotification(item: PendingApplication): void {
    const application = this.applications.find(
      app => app.id === item.accountOpeningApplicationId
    );

    this.showNotifications = false;

    if (application) {
      this.openReview(application);
    } else {
      this.loadApplications();
      this.showToast(
        `Application ${item.applicationRequestId} selected. Refresh the application list to review it.`,
        'info'
      );
    }
  }

  // FEATURE: Clean up notification polling
  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    void this.notificationService.stopConnection();
  }

    private startSignalRNotifications(): void {
    this.notificationSubscription =
      this.notificationService.newApplication$.subscribe({
        next: notification => {
          this.showToast(notification.message, 'info');

          // Refresh only when a new application event arrives.
          this.loadApplications();

          // Refresh notification count from the existing API.
          this.notificationService.getUnreadCount().subscribe({
            next: response => {
              this.notificationCount = response.unreadCount;
            },
            error: error => {
              console.error(
                'Failed to refresh notification count:',
                error
              );
            }
          });
        }
      });

    this.notificationService.startConnection().catch(error => {
      console.error('SignalR connection failed:', error);
    });
  }

markNotificationAsRead(item: AppNotification): void {
  this.notificationService
    .markAsRead(item.notificationId)
    .subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          notification =>
            notification.notificationId !== item.notificationId
        );

        this.notificationCount = Math.max(
          0,
          this.notificationCount - 1
        );
      },
      error: error => {
        console.error(
          'Failed to mark notification as read:',
          error
        );
      }
    });
}

markAllNotificationsAsRead(): void {
  this.notificationService.markAllAsRead().subscribe({
    next: () => {
      this.notifications = [];
      this.notificationCount = 0;
    },
    error: error => {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );
    }
  });
}


  getAverageReviewTime(durations: number[]): number | null {
    if (durations.length === 0) {
      return null;
    }

    const totalMinutes = durations.reduce(
      (total, minutes) => total + minutes,
      0
    );

    return Math.round(totalMinutes / durations.length);
  }

    
  loadDashboardStatistics(): void {
    this.reviewerService.getDashboardStatistics().subscribe({
      next: (response) => {
        this.dashboardStatistics = response;

        // Update values displayed by the existing cards.
        this.averageReviewTimeMinutes =
          response.averageReviewTimeMinutes;
      },
      error: (error) => {
        console.error('Failed to load dashboard statistics:', error);
      }
    });
  }



}
