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

export const routes: Routes = [
    {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component')
        .then(m => m.SettingsComponent)
  },
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
      component: LoanDetailsComponent,
      
    },
    {
      path: 'accounts',
      component: AccountsComponent
    },
  ]
},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];