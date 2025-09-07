// // src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AdminGuard } from './core/admin.guard';

export const routes: Routes = [
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) 
  },
  { 
    path: 'questions', 
    loadChildren: () => import('./features/questions/questions.routes').then(m => m.QUESTIONS_ROUTES) 
  },

  // Guard the admin feature BEFORE it loads
  {
    path: 'admin',
    canMatch: [AdminGuard],
    canActivate: [AdminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // About page (lazy-loaded standalone component)
  { 
    path: 'about', 
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) 
  },

  { path: '', redirectTo: 'questions', pathMatch: 'full' },
  { path: '**', redirectTo: 'questions' }
];


