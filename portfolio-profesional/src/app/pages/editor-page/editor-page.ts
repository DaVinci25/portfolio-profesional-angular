import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';

import {
  Portfolio,
  PortfolioSettings
} from '../../core/models/portfolio.model';
import { PortfolioStorageService } from '../../core/services/portfolio-storage.service';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editor-page.html',
  styleUrl: './editor-page.scss'
})
export class EditorPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageService = inject(PortfolioStorageService);

  activeSection = 'profile';
  progress = 0;
  message = '';
  saveStatus = 'Todos los cambios están guardados';

  readonly portfolioForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    professionalTitle: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
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
    if (index < 0 || index >= this.experiences.length) {
      return;
    }

    this.experiences.removeAt(index);
    this.showMessage('Experiencia eliminada correctamente.');
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
    if (index < 0 || index >= this.education.length) {
      return;
    }

    this.education.removeAt(index);
    this.showMessage('Formación eliminada correctamente.');
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
    if (index < 0 || index >= this.skills.length) {
      return;
    }

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
    if (index < 0 || index >= this.languages.length) {
      return;
    }

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
    if (index < 0 || index >= this.projects.length) {
      return;
    }

    this.projects.removeAt(index);
    this.showMessage('Proyecto eliminado correctamente.');
  }

  moveProject(index: number, direction: -1 | 1): void {
    this.moveItem(this.projects, index, direction);
  }

  uploadProjectImage(event: Event, projectIndex: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      this.showMessage('Selecciona una imagen JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      this.showMessage('La imagen original no puede superar los 6 MB.');
      input.value = '';
      return;
    }

    if (projectIndex < 0 || projectIndex >= this.projects.length) {
      this.showMessage('No se ha podido identificar el proyecto.');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const source = reader.result;

      if (typeof source !== 'string') {
        this.showMessage('No se ha podido leer la imagen.');
        input.value = '';
        return;
      }

      const image = new Image();
      image.onload = () => {
        try {
          const optimizedImage = this.resizeProjectImage(image);
          const project = this.projects.at(projectIndex);
          project?.get('image')?.setValue(optimizedImage);
          project?.markAsDirty();
          project?.updateValueAndValidity();
          this.showMessage('Imagen optimizada correctamente.');
        } catch (error) {
          console.error('Error procesando la imagen:', error);
          this.showMessage('No se ha podido procesar la imagen.');
        } finally {
          input.value = '';
        }
      };

      image.onerror = () => {
        this.showMessage('No se ha podido abrir la imagen seleccionada.');
        input.value = '';
      };

      image.src = source;
    };

    reader.onerror = () => {
      this.showMessage('Se produjo un error al leer la imagen.');
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  removeProjectImage(projectIndex: number): void {
    if (projectIndex < 0 || projectIndex >= this.projects.length) {
      return;
    }

    const project = this.projects.at(projectIndex);
    project?.get('image')?.setValue('');
    project?.markAsDirty();
    project?.updateValueAndValidity();
    this.showMessage('Imagen del proyecto eliminada.');
  }

  uploadProfileImage(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      this.showMessage('Selecciona una fotografía JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showMessage('La fotografía original no puede superar los 5 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const source = reader.result;

      if (typeof source !== 'string') {
        this.showMessage('No se ha podido leer la fotografía.');
        input.value = '';
        return;
      }

      const image = new Image();
      image.onload = () => {
        try {
          const optimizedImage = this.resizeProfileImage(image);
          this.portfolioForm.controls.profileImage.setValue(optimizedImage);
          this.showMessage('Fotografía optimizada correctamente.');
        } catch (error) {
          console.error('Error procesando la fotografía:', error);
          this.showMessage('No se ha podido procesar la fotografía.');
        } finally {
          input.value = '';
        }
      };

      image.onerror = () => {
        this.showMessage('No se ha podido abrir la fotografía.');
        input.value = '';
      };

      image.src = source;
    };

    reader.onerror = () => {
      this.showMessage('Se produjo un error al leer la fotografía.');
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.portfolioForm.controls.profileImage.setValue('');
    this.showMessage('Fotografía eliminada correctamente.');
  }

  selectSection(section: string): void {
    this.activeSection = section;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.getElementById(`section-${section}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  savePortfolio(showConfirmation = true): void {
    const portfolio = this.createPortfolioValue();
    const saved = this.storageService.save(portfolio);

    this.updateProgress();

    if (saved) {
      this.saveStatus = 'Guardado correctamente';
      if (showConfirmation) {
        this.showMessage('Portfolio guardado correctamente.');
      }
      return;
    }

    this.saveStatus = 'No se pudo guardar';
    this.showMessage('No hay espacio suficiente. Elimina alguna imagen o exporta una copia JSON.');
  }

  exportPortfolio(): void {
    const portfolio = this.createPortfolioValue();
    this.storageService.save(portfolio);
    this.storageService.exportToJson(portfolio);
    this.showMessage('Copia de seguridad descargada.');
  }

  async importPortfolio(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const portfolio = await this.storageService.importFromJson(file);
      this.loadData(portfolio);
      this.updateProgress();
      this.showMessage('Portfolio importado correctamente.');
    } catch (error) {
      this.showMessage(
        error instanceof Error ? error.message : 'No se ha podido importar el portfolio.'
      );
    } finally {
      input.value = '';
    }
  }

  resetPortfolio(): void {
    this.storageService.remove();
    this.portfolioForm.reset(this.createDefaultPortfolio());
    this.experiences.clear();
    this.education.clear();
    this.skills.clear();
    this.languages.clear();
    this.projects.clear();
    this.updateProgress();
    this.saveStatus = 'Restablecido';
    this.showMessage('Se han restablecido los datos del portfolio.');
  }

  private loadData(portfolio: Partial<Portfolio>): void {
    const defaults = this.createDefaultPortfolio();
    const mergedPortfolio: Portfolio = {
      ...defaults,
      ...portfolio,
      settings: {
        ...defaults.settings,
        ...(portfolio.settings ?? {})
      }
    };

    this.portfolioForm.reset(mergedPortfolio);
    this.resetFormArray(this.experiences, mergedPortfolio.experiences as unknown as Array<Record<string, unknown>>);
    this.resetFormArray(this.education, mergedPortfolio.education as unknown as Array<Record<string, unknown>>);
    this.resetFormArray(this.skills, mergedPortfolio.skills as unknown as Array<Record<string, unknown>>);
    this.resetFormArray(this.languages, mergedPortfolio.languages as unknown as Array<Record<string, unknown>>);
    this.resetFormArray(this.projects, mergedPortfolio.projects as unknown as Array<Record<string, unknown>>);
  }

  private createInitialData(): void {
    const initialPortfolio = this.createDefaultPortfolio();
    this.portfolioForm.reset(initialPortfolio);
    this.experiences.clear();
    this.education.clear();
    this.skills.clear();
    this.languages.clear();
    this.projects.clear();
  }

  private createDefaultPortfolio(): Portfolio {
    return {
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
      experiences: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      settings: {
        template: 'professional',
        primaryColor: '#4f46e5',
        darkMode: false,
        showPhoto: true
      },
      updatedAt: new Date().toISOString()
    };
  }

  private createPortfolioValue(): Portfolio {
    const raw = this.portfolioForm.getRawValue() as Partial<Portfolio> & {
      settings?: Partial<PortfolioSettings>;
    };

    const settings = (raw.settings ?? {}) as Partial<PortfolioSettings>;

    return {
      fullName: raw.fullName ?? '',
      professionalTitle: raw.professionalTitle ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      location: raw.location ?? '',
      website: raw.website ?? '',
      linkedin: raw.linkedin ?? '',
      github: raw.github ?? '',
      availability: raw.availability ?? 'Disponible para nuevas oportunidades',
      summary: raw.summary ?? '',
      profileImage: raw.profileImage ?? '',
      experiences: Array.isArray(raw.experiences) ? raw.experiences : [],
      education: Array.isArray(raw.education) ? raw.education : [],
      skills: Array.isArray(raw.skills) ? raw.skills : [],
      languages: Array.isArray(raw.languages) ? raw.languages : [],
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      settings: {
        template: settings.template ?? 'professional',
        primaryColor: settings.primaryColor ?? '#4f46e5',
        darkMode: Boolean(settings.darkMode),
        showPhoto: Boolean(settings.showPhoto)
      },
      updatedAt: new Date().toISOString()
    };
  }

  private updateProgress(): void {
    const portfolio = this.createPortfolioValue();
    this.progress = this.storageService.calculateProgress(portfolio);

    if (this.progress >= 100) {
      this.saveStatus = 'Portfolio completo';
      return;
    }

    this.saveStatus = 'Todos los cambios están guardados';
  }

  private configureAutoSave(): void {
    this.portfolioForm.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateProgress();
        this.savePortfolio(false);
      });
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
    }, 3200);
  }

  private moveItem(formArray: FormArray, index: number, direction: -1 | 1): void {
    if (index < 0 || index >= formArray.length) {
      return;
    }

    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= formArray.length) {
      return;
    }

    const item = formArray.at(index);
    formArray.removeAt(index);
    formArray.insert(targetIndex, item);
  }

  private resetFormArray(
    formArray: FormArray,
    items: Array<Record<string, unknown>> = []
  ): void {
    formArray.clear();
    items.forEach(item => {
      formArray.push(this.fb.group(item));
    });
  }

  private resizeProjectImage(image: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    const maxWidth = 1200;
    const maxHeight = 675;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No se pudo crear el contexto del canvas.');
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/webp', 0.82);
  }

  private resizeProfileImage(image: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    const maxWidth = 1000;
    const maxHeight = 1000;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No se pudo crear el contexto del canvas.');
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/webp', 0.8);
  }
}
