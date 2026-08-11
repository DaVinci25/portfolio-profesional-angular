import {
  DOCUMENT,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  Portfolio,
  Project
} from '../../core/models/portfolio.model';

import {
  PortfolioStorageService
} from '../../core/services/portfolio-storage.service';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss'
})
export class PortfolioPage implements OnInit {
  private readonly storageService = inject(
    PortfolioStorageService
  );

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  portfolio: Portfolio | null = null;

  ngOnInit(): void {
    this.portfolio = this.storageService.load();

    if (this.portfolio) {
      this.applyPortfolioSettings(this.portfolio);
    }
  }

  get initials(): string {
    const name = this.portfolio?.fullName.trim();

    if (!name) {
      return 'CV';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  get visibleExperiences() {
    return (
      this.portfolio?.experiences.filter(
        experience =>
          experience.visible &&
          Boolean(
            experience.company.trim() ||
            experience.position.trim()
          )
      ) ?? []
    );
  }

  get visibleEducation() {
    return (
      this.portfolio?.education.filter(
        education =>
          education.visible &&
          Boolean(
            education.institution.trim() ||
            education.qualification.trim()
          )
      ) ?? []
    );
  }

  get visibleSkills() {
    return (
      this.portfolio?.skills.filter(
        skill =>
          skill.visible &&
          Boolean(skill.name.trim())
      ) ?? []
    );
  }

  get visibleLanguages() {
    return (
      this.portfolio?.languages.filter(
        language =>
          language.visible &&
          Boolean(language.name.trim())
      ) ?? []
    );
  }

  get visibleProjects() {
    return (
      this.portfolio?.projects.filter(
        project =>
          project.visible &&
          Boolean(project.name.trim())
      ) ?? []
    );
  }

  get featuredProjects() {
    return this.visibleProjects.filter(
      project => project.featured
    );
  }

  formatTechnologies(project: Project): string[] {
    return project.technologies
      .split(',')
      .map(technology => technology.trim())
      .filter(Boolean);
  }

  formatDate(value: string): string {
    if (!value) {
      return '';
    }

    const [year, month] = value.split('-');

    if (!year || !month) {
      return value;
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    return new Intl.DateTimeFormat(
      'es-ES',
      {
        month: 'short',
        year: 'numeric'
      }
    ).format(date);
  }

  printPortfolio(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.print();
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
  }

  private applyPortfolioSettings(
    portfolio: Portfolio
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const primaryColor =
      portfolio.settings?.primaryColor ||
      '#4f46e5';

    this.document.documentElement.style.setProperty(
      '--portfolio-color',
      primaryColor
    );
  }
}