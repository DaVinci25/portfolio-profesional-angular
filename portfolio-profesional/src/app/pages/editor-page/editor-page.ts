import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Portfolio,
  PortfolioSettings
} from '../../core/models/portfolio.model';

import {
  PortfolioStorageService
} from '../../core/services/portfolio-storage.service';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './editor-page.html',
  styleUrl: './editor-page.scss'
})
export class EditorPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageService = inject(
    PortfolioStorageService
  );

  activeSection = 'profile';
  progress = 0;
  message = '';
  saveStatus = 'Todos los cambios están guardados';

  readonly portfolioForm = this.fb.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80)
      ]
    ],
    professionalTitle: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],
    email: [
      '',
      [
        Validators.email,
        Validators.maxLength(120)
      ]
    ],
    phone: [''],
    location: [''],
    website: [''],
    linkedin: [''],
    github: [''],
    availability: ['Disponible para nuevas oportunidades'],
    summary: ['', Validators.maxLength(900)],
    profileImage: [''],

    experiences: this.fb.array([]),
    education: this.fb.array([]),
    skills: this.fb.array([]),
    languages: this.fb.array([]),
    projects: this.fb.array([]),

    settings: this.fb.group({
      template: ['professional'],
      primaryColor: ['#4f46e5'],
      darkMode: [false],
      showPhoto: [true]
    }),

    updatedAt: ['']
  });

  ngOnInit(): void {
    const savedPortfolio = this.storageService.load();

    if (savedPortfolio) {
      this.loadData(savedPortfolio);
    } else {
      this.createInitialData();
    }

    this.updateProgress();
    this.configureAutoSave();
  }

  get experiences(): FormArray {
    return this.portfolioForm.controls.experiences;
  }

  get education(): FormArray {
    return this.portfolioForm.controls.education;
  }

  get skills(): FormArray {
    return this.portfolioForm.controls.skills;
  }

  get languages(): FormArray {
    return this.portfolioForm.controls.languages;
  }

  get projects(): FormArray {
    return this.portfolioForm.controls.projects;
  }

  get profileImage(): string {
    return this.portfolioForm.controls.profileImage.value ?? '';
  }

  get profileInitials(): string {
    const name = this.portfolioForm.controls.fullName.value?.trim();

    if (!name) {
      return 'CV';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  addExperience(data?: Partial<Portfolio['experiences'][number]>): void {
    this.experiences.push(
      this.fb.group({
        company: [data?.company ?? ''],
        position: [data?.position ?? ''],
        location: [data?.location ?? ''],
        startDate: [data?.startDate ?? ''],
        endDate: [data?.endDate ?? ''],
        currentJob: [data?.currentJob ?? false],
        description: [data?.description ?? ''],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
  }

  moveExperience(index: number, direction: -1 | 1): void {
    this.moveItem(this.experiences, index, direction);
  }

  addEducation(data?: Partial<Portfolio['education'][number]>): void {
    this.education.push(
      this.fb.group({
        institution: [data?.institution ?? ''],
        qualification: [data?.qualification ?? ''],
        specialization: [data?.specialization ?? ''],
        startYear: [data?.startYear ?? ''],
        endYear: [data?.endYear ?? ''],
        description: [data?.description ?? ''],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  moveEducation(index: number, direction: -1 | 1): void {
    this.moveItem(this.education, index, direction);
  }

  addSkill(data?: Partial<Portfolio['skills'][number]>): void {
    this.skills.push(
      this.fb.group({
        name: [data?.name ?? ''],
        level: [data?.level ?? 70],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  moveSkill(index: number, direction: -1 | 1): void {
    this.moveItem(this.skills, index, direction);
  }

  addLanguage(data?: Partial<Portfolio['languages'][number]>): void {
    this.languages.push(
      this.fb.group({
        name: [data?.name ?? ''],
        level: [data?.level ?? 'Intermedio'],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeLanguage(index: number): void {
    this.languages.removeAt(index);
  }

  addProject(data?: Partial<Portfolio['projects'][number]>): void {
    this.projects.push(
      this.fb.group({
        name: [data?.name ?? ''],
        description: [data?.description ?? ''],
        technologies: [data?.technologies ?? ''],
        demoUrl: [data?.demoUrl ?? ''],
        repositoryUrl: [data?.repositoryUrl ?? ''],
        image: [data?.image ?? ''],
        featured: [data?.featured ?? false],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeProject(index: number): void {
    this.projects.removeAt(index);
  }

  moveProject(index: number, direction: -1 | 1): void {
    this.moveItem(this.projects, index, direction);
  }

  selectSection(section: string): void {
    this.activeSection = section;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document
      .getElementById(`section-${section}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
  }

  savePortfolio(showMessage = true): void {
    const portfolio = this.createPortfolioValue();

    this.storageService.save(portfolio);
    this.updateProgress();

    this.saveStatus = 'Guardado correctamente';

    if (showMessage) {
      this.showMessage('Portfolio guardado correctamente');
    }
  }

  exportPortfolio(): void {
    this.savePortfolio(false);

    this.storageService.exportToJson(
      this.createPortfolioValue()
    );

    this.showMessage('Copia de seguridad descargada');
  }

  async importPortfolio(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const portfolio =
        await this.storageService.importFromJson(file);

      this.loadData(portfolio);
      this.updateProgress();

      this.showMessage(
        'Copia de seguridad importada correctamente'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo importar el archivo';

      this.showMessage(message);
    } finally {
      input.value = '';
    }
  }

  uploadProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!validTypes.includes(file.type)) {
      this.showMessage(
        'Selecciona una imagen JPG, PNG o WebP'
      );

      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.showMessage(
        'La fotografía debe ocupar menos de 2 MB'
      );

      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.portfolioForm.controls.profileImage.setValue(
        String(reader.result)
      );
    };

    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.portfolioForm.controls.profileImage.setValue('');
  }

  resetPortfolio(): void {
    if (
      isPlatformBrowser(this.platformId) &&
      !window.confirm(
        'Se eliminarán todos los datos del portfolio. ¿Continuar?'
      )
    ) {
      return;
    }

    this.clearDynamicSections();

    this.portfolioForm.reset({
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      availability: 'Disponible para nuevas oportunidades',
      summary: '',
      profileImage: '',
      updatedAt: '',
      settings: {
        template: 'professional',
        primaryColor: '#4f46e5',
        darkMode: false,
        showPhoto: true
      }
    });

    this.createInitialData();
    this.storageService.remove();
    this.updateProgress();

    this.showMessage('Portfolio restablecido');
  }

  private configureAutoSave(): void {
    this.portfolioForm.valueChanges
      .pipe(
        debounceTime(700),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.saveStatus = 'Guardando...';
        this.savePortfolio(false);
      });
  }

  private createInitialData(): void {
    this.portfolioForm.patchValue({
      fullName: 'Said El Morabiti Bakkali',
      professionalTitle: 'Desarrollador web',
      location: 'Madrid, España',
      summary:
        'Profesional orientado al aprendizaje continuo, la creación de soluciones digitales y la mejora de la experiencia del usuario.'
    });

    this.addExperience();
    this.addEducation();

    this.addSkill({
      name: 'Angular',
      level: 70,
      visible: true
    });

    this.addSkill({
      name: 'TypeScript',
      level: 65,
      visible: true
    });

    this.addLanguage({
      name: 'Español',
      level: 'Avanzado',
      visible: true
    });

    this.addProject();
  }

  private loadData(portfolio: Portfolio): void {
    this.clearDynamicSections();

    this.portfolioForm.patchValue({
      fullName: portfolio.fullName ?? '',
      professionalTitle:
        portfolio.professionalTitle ?? '',
      email: portfolio.email ?? '',
      phone: portfolio.phone ?? '',
      location: portfolio.location ?? '',
      website: portfolio.website ?? '',
      linkedin: portfolio.linkedin ?? '',
      github: portfolio.github ?? '',
      availability: portfolio.availability ?? '',
      summary: portfolio.summary ?? '',
      profileImage: portfolio.profileImage ?? '',
      updatedAt: portfolio.updatedAt ?? '',
      settings: {
        template:
          portfolio.settings?.template ?? 'professional',
        primaryColor:
          portfolio.settings?.primaryColor ?? '#4f46e5',
        darkMode:
          portfolio.settings?.darkMode ?? false,
        showPhoto:
          portfolio.settings?.showPhoto ?? true
      }
    });

    portfolio.experiences?.forEach(item =>
      this.addExperience(item)
    );

    portfolio.education?.forEach(item =>
      this.addEducation(item)
    );

    portfolio.skills?.forEach(item =>
      this.addSkill(item)
    );

    portfolio.languages?.forEach(item =>
      this.addLanguage(item)
    );

    portfolio.projects?.forEach(item =>
      this.addProject(item)
    );
  }

  private createPortfolioValue(): Portfolio {
    const raw = this.portfolioForm.getRawValue();

    const settings: PortfolioSettings = {
      template:
        (raw.settings?.template ??
          'professional') as PortfolioSettings['template'],
      primaryColor:
        raw.settings?.primaryColor ?? '#4f46e5',
      darkMode: raw.settings?.darkMode ?? false,
      showPhoto: raw.settings?.showPhoto ?? true
    };

    return {
      fullName: raw.fullName ?? '',
      professionalTitle:
        raw.professionalTitle ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      location: raw.location ?? '',
      website: raw.website ?? '',
      linkedin: raw.linkedin ?? '',
      github: raw.github ?? '',
      availability: raw.availability ?? '',
      summary: raw.summary ?? '',
      profileImage: raw.profileImage ?? '',
      experiences: raw.experiences as Portfolio['experiences'],
      education: raw.education as Portfolio['education'],
      skills: raw.skills as Portfolio['skills'],
      languages: raw.languages as Portfolio['languages'],
      projects: raw.projects as Portfolio['projects'],
      settings,
      updatedAt: new Date().toISOString()
    };
  }

  private updateProgress(): void {
    this.progress =
      this.storageService.calculateProgress(
        this.createPortfolioValue()
      );
  }

  private clearDynamicSections(): void {
    this.experiences.clear();
    this.education.clear();
    this.skills.clear();
    this.languages.clear();
    this.projects.clear();
  }

  private moveItem(
    formArray: FormArray,
    index: number,
    direction: -1 | 1
  ): void {
    const destination = index + direction;

    if (
      destination < 0 ||
      destination >= formArray.length
    ) {
      return;
    }

    const control = formArray.at(index);

    formArray.removeAt(index);
    formArray.insert(destination, control);
  }

  private showMessage(message: string): void {
    this.message = message;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.setTimeout(() => {
      if (this.message === message) {
        this.message = '';
      }
    }, 3500);
  }
}