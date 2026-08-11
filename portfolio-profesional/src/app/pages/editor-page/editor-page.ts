cat > src/app/pages/editor-page/editor-page.ts <<'EOF'
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
    availability: [
      'Disponible para nuevas oportunidades'
    ],
    summary: [
      '',
      Validators.maxLength(900)
    ],
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
    const savedPortfolio =
      this.storageService.load();

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
    return (
      this.portfolioForm.controls.profileImage.value ??
      ''
    );
  }

  get profileInitials(): string {
    const name =
      this.portfolioForm.controls.fullName.value?.trim();

    if (!name) {
      return 'CV';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  addExperience(
    data?: Partial<Portfolio['experiences'][number]>
  ): void {
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
    if (
      index < 0 ||
      index >= this.experiences.length
    ) {
      return;
    }

    this.experiences.removeAt(index);

    this.showMessage(
      'Experiencia eliminada correctamente.'
    );
  }

  moveExperience(
    index: number,
    direction: -1 | 1
  ): void {
    this.moveItem(
      this.experiences,
      index,
      direction
    );
  }

  addEducation(
    data?: Partial<Portfolio['education'][number]>
  ): void {
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
    if (
      index < 0 ||
      index >= this.education.length
    ) {
      return;
    }

    this.education.removeAt(index);

    this.showMessage(
      'Formación eliminada correctamente.'
    );
  }

  moveEducation(
    index: number,
    direction: -1 | 1
  ): void {
    this.moveItem(
      this.education,
      index,
      direction
    );
  }

  addSkill(
    data?: Partial<Portfolio['skills'][number]>
  ): void {
    this.skills.push(
      this.fb.group({
        name: [data?.name ?? ''],
        level: [data?.level ?? 70],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeSkill(index: number): void {
    if (
      index < 0 ||
      index >= this.skills.length
    ) {
      return;
    }

    this.skills.removeAt(index);
  }

  moveSkill(
    index: number,
    direction: -1 | 1
  ): void {
    this.moveItem(
      this.skills,
      index,
      direction
    );
  }

  addLanguage(
    data?: Partial<Portfolio['languages'][number]>
  ): void {
    this.languages.push(
      this.fb.group({
        name: [data?.name ?? ''],
        level: [data?.level ?? 'Intermedio'],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeLanguage(index: number): void {
    if (
      index < 0 ||
      index >= this.languages.length
    ) {
      return;
    }

    this.languages.removeAt(index);
  }

  addProject(
    data?: Partial<Portfolio['projects'][number]>
  ): void {
    this.projects.push(
      this.fb.group({
        name: [data?.name ?? ''],
        description: [data?.description ?? ''],
        technologies: [data?.technologies ?? ''],
        demoUrl: [data?.demoUrl ?? ''],
        repositoryUrl: [
          data?.repositoryUrl ?? ''
        ],
        image: [data?.image ?? ''],
        featured: [data?.featured ?? false],
        visible: [data?.visible ?? true]
      })
    );
  }

  removeProject(index: number): void {
    if (
      index < 0 ||
      index >= this.projects.length
    ) {
      return;
    }

    this.projects.removeAt(index);

    this.showMessage(
      'Proyecto eliminado correctamente.'
    );
  }

  moveProject(
    index: number,
    direction: -1 | 1
  ): void {
    this.moveItem(
      this.projects,
      index,
      direction
    );
  }

  uploadProjectImage(
    event: Event,
    projectIndex: number
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const input =
      event.target as HTMLInputElement;

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
        'Selecciona una imagen JPG, PNG o WebP.'
      );

      input.value = '';
      return;
    }

    const maximumOriginalSize =
      6 * 1024 * 1024;

    if (file.size > maximumOriginalSize) {
      this.showMessage(
        'La imagen original no puede superar los 6 MB.'
      );

      input.value = '';
      return;
    }

    if (
      projectIndex < 0 ||
      projectIndex >= this.projects.length
    ) {
      this.showMessage(
        'No se ha podido identificar el proyecto.'
      );

      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const source = reader.result;

      if (typeof source !== 'string') {
        this.showMessage(
          'No se ha podido leer la imagen.'
        );

        input.value = '';
        return;
      }

      const image = new Image();

      image.onload = () => {
        try {
          const optimizedImage =
            this.resizeProjectImage(image);

          const project =
            this.projects.at(projectIndex);

          project
            .get('image')
            ?.setValue(optimizedImage);

          project.markAsDirty();
          project.updateValueAndValidity();

          this.showMessage(
            'Imagen optimizada correctamente.'
          );
        } catch (error) {
          console.error(
            'Error procesando la imagen:',
            error
          );

          this.showMessage(
            'No se ha podido procesar la imagen.'
          );
        } finally {
          input.value = '';
        }
      };

      image.onerror = () => {
        this.showMessage(
          'No se ha podido abrir la imagen seleccionada.'
        );

        input.value = '';
      };

      image.src = source;
    };

    reader.onerror = () => {
      this.showMessage(
        'Se produjo un error al leer la imagen.'
      );

      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  removeProjectImage(
    projectIndex: number
  ): void {
    if (
      projectIndex < 0 ||
      projectIndex >= this.projects.length
    ) {
      return;
    }

    const project =
      this.projects.at(projectIndex);

    project
      .get('image')
      ?.setValue('');

    project.markAsDirty();
    project.updateValueAndValidity();

    this.showMessage(
      'Imagen del proyecto eliminada.'
    );
  }

  uploadProfileImage(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const input =
      event.target as HTMLInputElement;

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
        'Selecciona una fotografía JPG, PNG o WebP.'
      );

      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showMessage(
        'La fotografía original no puede superar los 5 MB.'
      );

      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const source = reader.result;

      if (typeof source !== 'string') {
        this.showMessage(
          'No se ha podido leer la fotografía.'
        );

        input.value = '';
        return;
      }

      const image = new Image();

      image.onload = () => {
        try {
          const optimizedImage =
            this.resizeProfileImage(image);

          this.portfolioForm.controls
            .profileImage
            .setValue(optimizedImage);

          this.showMessage(
            'Fotografía optimizada correctamente.'
          );
        } catch (error) {
          console.error(
            'Error procesando la fotografía:',
            error
          );

          this.showMessage(
            'No se ha podido procesar la fotografía.'
          );
        } finally {
          input.value = '';
        }
      };

      image.onerror = () => {
        this.showMessage(
          'No se ha podido abrir la fotografía.'
        );

        input.value = '';
      };

      image.src = source;
    };

    reader.onerror = () => {
      this.showMessage(
        'Se produjo un error al leer la fotografía.'
      );

      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.portfolioForm.controls
      .profileImage
      .setValue('');

    this.showMessage(
      'Fotografía eliminada correctamente.'
    );
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

  savePortfolio(
    showConfirmation = true
  ): void {
    const portfolio =
      this.createPortfolioValue();

    const saved =
      this.storageService.save(portfolio);

    this.updateProgress();

    if (saved) {
      this.saveStatus =
        'Guardado correctamente';

      if (showConfirmation) {
        this.showMessage(
          'Portfolio guardado correctamente.'
        );
      }

      return;
    }

    this.saveStatus =
      'No se pudo guardar';

    this.showMessage(
      'No hay espacio suficiente. Elimina alguna imagen o exporta una copia JSON.'
    );
  }

  exportPortfolio(): void {
    const portfolio =
      this.createPortfolioValue();

    this.storageService.save(portfolio);
    this.storageService.exportToJson(portfolio);

    this.showMessage(
      'Copia de seguridad descargada.'
    );
  }

  async importPortfolio(
    event: Event
  ): Promise<void> {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

   