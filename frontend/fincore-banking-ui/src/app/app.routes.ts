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

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
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
  ]
},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];