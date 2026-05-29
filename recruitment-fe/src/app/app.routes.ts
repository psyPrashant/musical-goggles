import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'assessments',
        loadComponent: () =>
          import('./features/assessments/assessments.component').then(m => m.AssessmentsComponent),
      },
      {
        path: 'assessments/new',
        loadComponent: () =>
          import('./features/assessments/assessment-builder.component').then(
            m => m.AssessmentBuilderComponent,
          ),
      },
      {
        path: 'assessments/:id/edit',
        loadComponent: () =>
          import('./features/assessments/assessment-builder.component').then(
            m => m.AssessmentBuilderComponent,
          ),
      },
      {
        path: 'assessments/:id/preview',
        loadComponent: () =>
          import('./features/assessments/assessment-preview.component').then(
            m => m.AssessmentPreviewComponent,
          ),
      },
      {
        path: 'assessments/:id',
        loadComponent: () =>
          import('./features/assessments/assessment-builder.component').then(
            m => m.AssessmentBuilderComponent,
          ),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./features/questions/questions.component').then(m => m.QuestionsComponent),
      },
      {
        path: 'questions/new',
        loadComponent: () =>
          import('./features/questions/question-form.component').then(m => m.QuestionFormComponent),
      },
      {
        path: 'questions/:id/edit',
        loadComponent: () =>
          import('./features/questions/question-form.component').then(m => m.QuestionFormComponent),
      },
      {
        path: 'question-groups',
        loadComponent: () =>
          import('./features/question-groups/question-groups.component').then(
            m => m.QuestionGroupsComponent,
          ),
      },
      {
        path: 'question-groups/:id',
        loadComponent: () =>
          import('./features/question-groups/question-group-detail.component').then(
            m => m.QuestionGroupDetailComponent,
          ),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('./features/candidates/candidates.component').then(m => m.CandidatesComponent),
      },
      {
        path: 'results',
        loadComponent: () =>
          import('./features/results/results.component').then(m => m.ResultsComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'assessment/:id/take',
    loadComponent: () =>
      import('./features/assessments/assessment-take.component').then(
        m => m.AssessmentTakeComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
