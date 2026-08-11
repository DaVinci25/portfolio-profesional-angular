import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  inject
} from '@angular/core';

import { Portfolio } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  private readonly storageKey = 'portfolio-profesional-v2';

  save(portfolio: Portfolio): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const data: Portfolio = {
      ...portfolio,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(data)
    );
  }

  load(): Portfolio | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedData = localStorage.getItem(this.storageKey);

    if (!storedData) {
      return null;
    }

    try {
      return JSON.parse(storedData) as Portfolio;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  remove(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }

  exportToJson(portfolio: Portfolio): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const data: Portfolio = {
      ...portfolio,
      updatedAt: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob(
      [json],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');

    const safeName = this.createSafeFileName(
      portfolio.fullName || 'portfolio'
    );

    anchor.href = url;
    anchor.download = `${safeName}-portfolio.json`;

    this.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  importFromJson(file: File): Promise<Portfolio> {
    return new Promise((resolve, reject) => {
      if (file.type && file.type !== 'application/json') {
        reject(
          new Error('El archivo debe tener formato JSON.')
        );

        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const content = String(reader.result);
          const data = JSON.parse(content) as Portfolio;

          if (!this.isValidPortfolio(data)) {
            reject(
              new Error(
                'El archivo no contiene un portfolio válido.'
              )
            );

            return;
          }

          this.save(data);
          resolve(data);
        } catch {
          reject(
            new Error('No se pudo leer el archivo JSON.')
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error('Se produjo un error al leer el archivo.')
        );
      };

      reader.readAsText(file);
    });
  }

  calculateProgress(portfolio: Partial<Portfolio>): number {
    const checks = [
      Boolean(portfolio.fullName?.trim()),
      Boolean(portfolio.professionalTitle?.trim()),
      Boolean(portfolio.email?.trim()),
      Boolean(portfolio.location?.trim()),
      Boolean(portfolio.summary?.trim()),
      Boolean(portfolio.profileImage),
      Boolean(portfolio.experiences?.length),
      Boolean(portfolio.education?.length),
      Boolean(portfolio.skills?.length),
      Boolean(portfolio.projects?.length),
      Boolean(portfolio.github || portfolio.linkedin)
    ];

    const completed = checks.filter(Boolean).length;

    return Math.round(
      (completed / checks.length) * 100
    );
  }

  private isValidPortfolio(value: unknown): value is Portfolio {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const portfolio = value as Partial<Portfolio>;

    return (
      typeof portfolio.fullName === 'string' &&
      typeof portfolio.professionalTitle === 'string' &&
      Array.isArray(portfolio.experiences) &&
      Array.isArray(portfolio.education) &&
      Array.isArray(portfolio.skills) &&
      Array.isArray(portfolio.projects)
    );
  }

  private createSafeFileName(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}