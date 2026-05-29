import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'questions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/questions/questions.component').then(m => m.QuestionsComponent),
  },
  {
    path: 'questions/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/questions/question-form.component').then(m => m.QuestionFormComponent),
  },
  {
    path: 'questions/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/questions/question-form.component').then(m => m.QuestionFormComponent),
  },
  {
    path: 'question-groups',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/question-groups/question-groups.component').then(m => m.QuestionGroupsComponent),
  },
  {
    path: 'question-groups/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/question-groups/question-group-detail.component').then(m => m.QuestionGroupDetailComponent),
  },
  {
    path: 'assessments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/assessments.component').then(m => m.AssessmentsComponent),
  },
  {
    path: 'assessments/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/assessment-form.component').then(m => m.AssessmentFormComponent),
  },
  {
    path: 'assessments/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/assessment-form.component').then(m => m.AssessmentFormComponent),
  },
  {
    path: 'assessments/:id/preview',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/assessment-preview.component').then(m => m.AssessmentPreviewComponent),
  },
  {
    path: 'assessments/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/assessment-detail.component').then(m => m.AssessmentDetailComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
