import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Portfolio Studio',
    loadComponent: () =>
      import('./pages/home-page/home-page').then(
        component => component.HomePage
      )
  },
  {
    path: 'editor',
    title: 'Editor | Portfolio Studio',
    loadComponent: () =>
      import('./pages/editor-page/editor-page').then(
        component => component.EditorPage
      )
  },
  {
    path: 'portfolio',
    title: 'Portfolio profesional',
    loadComponent: () =>
      import('./pages/portfolio-page/portfolio-page').then(
        component => component.PortfolioPage
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];