import { Routes } from '@angular/router';
import { Account } from './account/account';
import { ChangePassword } from './auth/change-password/change-password';
import { passwordChangeGuard } from './guards/password-change-guard';
import { RoleForm } from './settings/role-form/role-form';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Login } from './auth/login/login';
import { Layout } from './components/layout/layout';
import { Home } from './dashboard/home/home';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { NotFound } from './not-found/not-found';
import { Settings } from './settings/settings';
import { MemberList } from './members/member-list/member-list';
import { UserForm } from './members/user-form/user-form';
import { ItemForm } from './vaults/item-form/item-form';
import { VaultDetail } from './vaults/vault-detail/vault-detail';
import { VaultForm } from './vaults/vault-form/vault-form';
import { VaultList } from './vaults/vault-list/vault-list';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [guestGuard] },
  { path: 'change-password', component: ChangePassword, canActivate: [passwordChangeGuard] },
  {
    path: 'dashboard',
    component: Layout,
    canActivate: [authGuard, passwordChangeGuard],
    children: [
      { path: '', component: Home },
      {
        path: 'vaults',
        children: [
          { path: '', component: VaultList },
          { path: 'new', component: VaultForm, canActivate: [adminGuard] },
          { path: ':id', component: VaultDetail },
          { path: ':id/edit', component: VaultForm, canActivate: [adminGuard] },
          { path: ':id/items/new/:type', component: ItemForm },
          { path: ':id/items/:itemId/edit', component: ItemForm },
        ],
      },
      { path: 'settings', component: Settings },
      { path: 'members', component: MemberList, canActivate: [adminGuard] },
      { path: 'members/new', component: UserForm, canActivate: [adminGuard] },
      { path: 'members/:userId/edit', component: UserForm, canActivate: [adminGuard] },
      { path: 'settings/roles/new', component: RoleForm, canActivate: [adminGuard] },
      { path: 'settings/roles/:roleId/edit', component: RoleForm, canActivate: [adminGuard] },
      { path: 'account', component: Account },
    ],
  },
  { path: '**', component: NotFound },
];
