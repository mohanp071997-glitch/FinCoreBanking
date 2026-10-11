import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// FEATURE: Application status and review models.
type ApplicationStatus = 'Pending Review' | 'Verified' | 'Rejected';
type SortField =
  | 'requestId'
  | 'customerName'
  | 'accountType'
  | 'applicationDate'
  | 'documentsVerified'
  | 'status';

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
export class ReviewerDashboardComponent {

  // FEATURE: Dashboard header and reviewer profile.
  today = new Date();
  reviewerName = 'Rajesh Kumar';
  reviewerRole = 'Application Reviewer';

  // FEATURE: Sidebar navigation.
  activeMenu = 'Dashboard';
  applicationsMenuExpanded = true;

  // FEATURE: Header interactions.
  globalSearch = '';
  showNotifications = false;
  showProfileMenu = false;
  notificationCount = 3;

  // FEATURE: Application filters.
  activeTab = 'All Applications';
  selectedAccountType = 'All Types';
  selectedDateRange = 'Last 30 Days';
  selectedStatus = 'All Status';

  // FEATURE: Pagination.
  currentPage = 1;
  pageSize = 8;

  // FEATURE: Sorting.
  sortField: SortField = 'applicationDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // FEATURE: Review dialog state.
  showReviewModal = false;
  selectedApplication: ReviewApplication | null = null;
  reviewDecision: 'Verified' | 'Rejected' = 'Verified';
  reviewComments = '';

  // FEATURE: Toast messages.
  toastMessage = '';
  toastType: 'success' | 'info' = 'info';

  // FEATURE: Selected application IDs.
  selectedIds: number[] = [];

  /*
   * FEATURE: Sample application data.
   * Replace this array with your .NET API response
   * when you connect the real backend.
   */
  applications: ReviewApplication[] = [
    {
      id: 7,
      requestId: '000649526323',
      customerName: 'Teju',
      email: 'mohanpalaniappanpm1997@gmail.com',
      mobile: '9876543210',
      accountType: 'Savings Account',
      applicationDate: '10 Oct 2026',
      applicationTime: '05:51 PM',
      sortDate: '2026-10-10T17:51:40',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 8,
      requestId: '000649526322',
      customerName: 'Arun Kumar',
      email: 'arun.kumar@example.com',
      mobile: '9876543211',
      accountType: 'Current Account',
      applicationDate: '10 Oct 2026',
      applicationTime: '04:30 PM',
      sortDate: '2026-10-10T16:30:00',
      documentsVerified: 3,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 9,
      requestId: '000649526321',
      customerName: 'Priya Sharma',
      email: 'priya@example.com',
      mobile: '9876543212',
      accountType: 'Savings Account',
      applicationDate: '09 Oct 2026',
      applicationTime: '03:20 PM',
      sortDate: '2026-10-09T15:20:00',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 10,
      requestId: '000649526320',
      customerName: 'Suresh R',
      email: 'suresh@example.com',
      mobile: '9876543213',
      accountType: 'Current Account',
      applicationDate: '09 Oct 2026',
      applicationTime: '11:15 AM',
      sortDate: '2026-10-09T11:15:00',
      documentsVerified: 2,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 11,
      requestId: '000649526319',
      customerName: 'Anitha V',
      email: 'anitha@example.com',
      mobile: '9876543214',
      accountType: 'Savings Account',
      applicationDate: '09 Oct 2026',
      applicationTime: '10:45 AM',
      sortDate: '2026-10-09T10:45:00',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Verified'
    },
    {
      id: 12,
      requestId: '000649526318',
      customerName: 'Vikram S',
      email: 'vikram@example.com',
      mobile: '9876543215',
      accountType: 'NRI Account',
      applicationDate: '08 Oct 2026',
      applicationTime: '02:10 PM',
      sortDate: '2026-10-08T14:10:00',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 13,
      requestId: '000649526317',
      customerName: 'Divya M',
      email: 'divya@example.com',
      mobile: '9876543216',
      accountType: 'Savings Account',
      applicationDate: '08 Oct 2026',
      applicationTime: '01:00 PM',
      sortDate: '2026-10-08T13:00:00',
      documentsVerified: 3,
      totalDocuments: 4,
      status: 'Rejected'
    },
    {
      id: 14,
      requestId: '000649526316',
      customerName: 'Karthik P',
      email: 'karthik@example.com',
      mobile: '9876543217',
      accountType: 'Current Account',
      applicationDate: '07 Oct 2026',
      applicationTime: '12:10 PM',
      sortDate: '2026-10-07T12:10:00',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 15,
      requestId: '000649526315',
      customerName: 'Meena R',
      email: 'meena@example.com',
      mobile: '9876543218',
      accountType: 'Savings Account',
      applicationDate: '07 Oct 2026',
      applicationTime: '10:30 AM',
      sortDate: '2026-10-07T10:30:00',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Pending Review'
    },
    {
      id: 16,
      requestId: '000649526314',
      customerName: 'Ramesh K',
      email: 'ramesh@example.com',
      mobile: '9876543219',
      accountType: 'NRI Account',
      applicationDate: '06 Oct 2026',
      applicationTime: '09:45 AM',
      sortDate: '2026-10-06T09:45:00',
      documentsVerified: 4,
      totalDocuments: 4,
      status: 'Verified'
    }
  ];

  // FEATURE: Recent review activity sample data.
  activities: ReviewActivity[] = [
    {
      title: 'Application verified',
      requestId: '000649526319',
      customerName: 'Anitha V',
      timeAgo: '20 minutes ago',
      type: 'verified'
    },
    {
      title: 'Application rejected',
      requestId: '000649526317',
      customerName: 'Divya M',
      timeAgo: '45 minutes ago',
      type: 'rejected'
    },
    {
      title: 'Application verified',
      requestId: '000649526314',
      customerName: 'Ramesh K',
      timeAgo: '1 hour ago',
      type: 'verified'
    }
  ];

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
            applicationDate.toDateString() === now.toDateString();
        } else if (this.selectedDateRange === 'Last 7 Days') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);
          matchesDate = applicationDate >= cutoff && applicationDate <= now;
        } else if (this.selectedDateRange === 'Last 30 Days') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 30);
          matchesDate = applicationDate >= cutoff && applicationDate <= now;
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
        this.activeTab = 'All Applications';
        this.selectedStatus = 'All Status';
        break;

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

  // FEATURE: Open application review dialog.
  openReview(app: ReviewApplication): void {
    this.selectedApplication = app;
    this.reviewDecision = 'Verified';
    this.reviewComments = '';
    this.showReviewModal = true;
  }

  closeReview(): void {
    this.showReviewModal = false;
    this.selectedApplication = null;
    this.reviewComments = '';
  }

  // FEATURE: Verify/reject an application in demo UI.
  submitReview(): void {
    if (!this.selectedApplication) {
      return;
    }

    const app = this.selectedApplication;

    if (app.status !== 'Pending Review') {
      this.showToast(
        'This application has already been reviewed.',
        'info'
      );
      this.closeReview();
      return;
    }

    if (
      this.reviewDecision === 'Verified' &&
      app.documentsVerified !== app.totalDocuments
    ) {
      this.showToast(
        'Verify all required documents before approving this review.',
        'info'
      );
      return;
    }

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

    app.status = this.reviewDecision;
    app.comments = this.reviewComments.trim();

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

    this.notificationCount = Math.max(0, this.notificationCount - 1);

    this.showToast(
      this.reviewDecision === 'Verified'
        ? `Application ${app.requestId} verified in demo mode.`
        : `Application ${app.requestId} rejected in demo mode.`,
      'success'
    );

    this.closeReview();
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

    this.showToast('CSV export generated successfully.', 'success');
  }

  // FEATURE: Display UI feedback.
  showToast(
    message: string,
    type: 'success' | 'info' = 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
  }
}

