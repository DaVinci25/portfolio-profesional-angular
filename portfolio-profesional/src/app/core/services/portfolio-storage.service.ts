
import {
  DOCUMENT,
  isPlatformBrowser
} from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  Portfolio
} from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioStorageService {
  private readonly platformId =
    inject(PLATFORM_ID);

  private readonly document =
    inject(DOCUMENT);

  private readonly storageKey =
    'portfolio-profesional-v2';

  save(portfolio: Portfolio): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const data: Portfolio = {
      ...portfolio,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error(
        'No se pudo guardar el portfolio:',
        error
      );

      return false;
    }
  }

  load(): Portfolio | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedData =
      localStorage.getItem(this.storageKey);

    if (!storedData) {
      return null;
    }

    try {
      const parsedData: unknown =
        JSON.parse(storedData);

      if (!this.isValidPortfolio(parsedData)) {
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error(
        'No se pudo cargar el portfolio:',
        error
      );

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

  exportToJson(
    portfolio: Portfolio
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const data: Portfolio = {
      ...portfolio,
      updatedAt: new Date().toISOString()
    };

    const json =
      JSON.stringify(data, null, 2);

    const blob = new Blob(
      [json],
      {
        type: 'application/json'
      }
    );

    const objectUrl =
      URL.createObjectURL(blob);

    const link =
      this.document.createElement('a');

    const fileName =
      this.createSafeFileName(
        portfolio.fullName || 'portfolio'
      );

    link.href = objectUrl;
    link.download =
      `${fileName}-portfolio.json`;

    this.document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);
  }

  importFromJson(
    file: File
  ): Promise<Portfolio> {
    return new Promise(
      (resolve, reject) => {
        if (!isPlatformBrowser(this.platformId)) {
          reject(
            new Error(
              'La importación solo puede realizarse en el navegador.'
            )
          );

          return;
        }

        const isJson =
          file.type === 'application/json' ||
          file.name
            .toLowerCase()
            .endsWith('.json');

        if (!isJson) {
          reject(
            new Error(
              'El archivo debe tener formato JSON.'
            )
          );

          return;
        }

        const reader =
          new FileReader();

        reader.onload = () => {
          try {
            const content =
              String(reader.result);

            const parsedData: unknown =
              JSON.parse(content);

            if (
              !this.isValidPortfolio(parsedData)
            ) {
              reject(
                new Error(
                  'El archivo no contiene un portfolio válido.'
                )
              );

              return;
            }

            const saved =
              this.save(parsedData);

            if (!saved) {
              reject(
                new Error(
                  'El portfolio es demasiado grande para guardarlo en el navegador.'
                )
              );

              return;
            }

            resolve(parsedData);
          } catch {
            reject(
              new Error(
                'No se ha podido interpretar el archivo JSON.'
              )
            );
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              'Se produjo un error al leer el archivo.'
            )
          );
        };

        reader.readAsText(file);
      }
    );
  }

  calculateProgress(
    portfolio: Partial<Portfolio>
  ): number {
    const hasExperience = Boolean(
      portfolio.experiences?.some(
        experience =>
          Boolean(
            experience.company.trim()
          ) ||
          Boolean(
            experience.position.trim()
          )
      )
    );

    const hasEducation = Boolean(
      portfolio.education?.some(
        education =>
          Boolean(
            education.institution.trim()
          ) ||
          Boolean(
            education.qualification.trim()
          )
      )
    );

    const hasSkills = Boolean(
      portfolio.skills?.some(
        skill =>
          Boolean(skill.name.trim())
      )
    );

    const hasProjects = Boolean(
      portfolio.projects?.some(
        project =>
          Boolean(project.name.trim())
      )
    );

    const checks = [
      Boolean(portfolio.fullName?.trim()),
      Boolean(
        portfolio.professionalTitle?.trim()
      ),
      Boolean(portfolio.email?.trim()),
      Boolean(portfolio.location?.trim()),
      Boolean(portfolio.summary?.trim()),
      Boolean(portfolio.profileImage),
      hasExperience,
      hasEducation,
      hasSkills,
      hasProjects,
      Boolean(
        portfolio.github?.trim() ||
        portfolio.linkedin?.trim()
      )
    ];

    const completed =
      checks.filter(Boolean).length;

    return Math.round(
      (completed / checks.length) * 100
    );
  }

  private isValidPortfolio(
    value: unknown
  ): value is Portfolio {
    if (
      value === null ||
      typeof value !== 'object'
    ) {
      return false;
    }

    const portfolio =
      value as Partial<Portfolio>;

    return (
      typeof portfolio.fullName === 'string' &&
      typeof portfolio.professionalTitle === 'string' &&
      Array.isArray(portfolio.experiences) &&
      Array.isArray(portfolio.education) &&
      Array.isArray(portfolio.skills) &&
      Array.isArray(portfolio.languages) &&
      Array.isArray(portfolio.projects)
    );
  }

  private createSafeFileName(
    value: string
  ): string {
    const result = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return result || 'portfolio';
  }
}
EOF