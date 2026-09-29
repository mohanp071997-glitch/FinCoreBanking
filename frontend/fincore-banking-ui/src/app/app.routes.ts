import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FundTransferComponent } from './pages/fund-transfer/fund-transfer.component';
import { authGuard } from './guards/auth.guard';
import { BeneficiariesComponent } from './pages/beneficiaries/beneficiaries.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
   // Protects the dashboard route.
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
    // Protects the fund transfer route.
  {
    path: 'fund-transfer',
    component: FundTransferComponent,
    canActivate: [authGuard]
  },
  // Protects the beneficiaries route.
{
  path: 'beneficiaries',
  component: BeneficiariesComponent,
  canActivate: [authGuard]
},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];