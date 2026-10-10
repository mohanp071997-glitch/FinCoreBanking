import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FundTransferComponent } from './pages/fund-transfer/fund-transfer.component';
import { authGuard } from './guards/auth.guard';
import { BeneficiariesComponent } from './pages/beneficiaries/beneficiaries.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { CardsComponent } from './pages/cards/cards.component';
import { LoansComponent } from './pages/loans/loans.component';
import { LoanDetailsComponent } from './pages/loan-details/loan-details.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { HomeComponent } from './pages/home/home.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { SavingsAccountComponent } from './pages/savings-account/savings-account.component';
import { TrackRequestComponent } from './pages/track-request/track-request.component';

export const routes: Routes = [

  // Home page.
  {
    path: '',
    component: HomeComponent
  },

  // Login page.
  {
    path: 'login',
    component: LoginComponent
  },

  // Settings page.
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component')
        .then(m => m.SettingsComponent)
  },

  // OTP verification page.
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./pages/verify-otp/verify-otp.component')
        .then(m => m.VerifyOtpComponent)
  },

  // Protected application layout.
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'fund-transfer',
        component: FundTransferComponent
      },

      {
        path: 'beneficiaries',
        component: BeneficiariesComponent
      },

      {
        path: 'profile',
        component: ProfileComponent
      },

      {
        path: 'transactions',
        component: TransactionsComponent
      },

      {
        path: 'cards',
        component: CardsComponent
      },

      {
        path: 'loans',
        component: LoansComponent
      },

      {
        path: 'loans/:id',
        component: LoanDetailsComponent
      },

      {
        path: 'accounts',
        component: AccountsComponent
      }
    ]
  },

  // NRI page.
  {
    path: 'nri',
    loadComponent: () =>
      import('./pages/nri/nri.component')
        .then(m => m.NriComponent)
  },
    { path: 'forgot-password', 
      component: ForgotPasswordComponent },

  // Business page.
  {
  path: 'business',
  loadComponent: () =>
    import('./pages/business/business.component')
      .then(m => m.BusinessComponent)
  },
  {
    path: 'savings-account',
    loadComponent: () =>
      import('./pages/savings-account/savings-account.component')
        .then(m => m.SavingsAccountComponent),
        data: {
                breadcrumb: [
                  { label: 'Personal', url: '/personal' },
                  { label: 'Accounts', url: '/personal/accounts' },
                  { label: 'Savings Account' }
                ]
              }
  },
  // FEATURE: Savings Account Application Page
  // Navigates to the new multi-step account opening form.

{
  path: 'open-savings-account',
  loadComponent: () =>
    import('./pages/savings-application/savings-application.component')
      .then(m => m.SavingsApplicationComponent)
},
{
  path: 'track-request',
  component: TrackRequestComponent
}

];