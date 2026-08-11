import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser
} from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PortfolioData {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  availability: string;
  profileImage: string;
  experiences: unknown[];
  education: unknown[];
  skills: unknown[];
  languages: unknown[];
  projects: unknown[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly storageKey = 'portfolio-profesional-v2';
  private readonly themeKey = 'portfolio-theme';

  editorVisible = true;
  darkMode = false;
  savedMessage = '';
  activeSection = 'personal';

  readonly portfolioForm = this.fb.group({
    fullName: [
      'Said El Morabiti Bakkali',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80)
      ]
    ],
    professionalTitle: [
      'Desarrollador web',
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
    phone: ['', Validators.maxLength(30)],
    location: ['Madrid, España', Validators.maxLength(100)],
    website: [''],
    linkedin: [''],
    github: [''],
    availability: ['Disponible para nuevas oportunidades'],
    summary: [
      'Profesional con capacidad de aprendizaje, orientación a resultados y motivación por desarrollar soluciones digitales útiles y accesibles.',
      Validators.maxLength(800)
    ],
    profileImage: [''],
    experiences: this.fb.array([]),
    education: this.fb.array([]),
    skills: this.fb.array([]),
    languages: this.fb.array([]),
    projects: this.fb.array([])
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
      this.loadPortfolio();
      this.configureAutoSave();
    }

    this.createInitialItems();
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

  get fullName(): AbstractControl | null {
    return this.portfolioForm.get('fullName');
  }

  get professionalTitle(): AbstractControl | null {
    return this.portfolioForm.get('professionalTitle');
  }

  get email(): AbstractControl | null {
    return this.portfolioForm.get('email');
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

  addExperience(data?: Record<string, unknown>): void {
    this.experiences.push(
      this.fb.group({
        company: [this.getText(data, 'company')],
        position: [this.getText(data, 'position')],
        location: [this.getText(data, 'location')],
        startDate: [this.getText(data, 'startDate')],
        endDate: [this.getText(data, 'endDate')],
        currentJob: [this.getBoolean(data, 'currentJob')],
        description: [this.getText(data, 'description')]
      })
    );
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
  }

  addEducation(data?: Record<string, unknown>): void {
    this.education.push(
      this.fb.group({
        institution: [this.getText(data, 'institution')],
        qualification: [this.getText(data, 'qualification')],
        specialization: [this.getText(data, 'specialization')],
        startYear: [this.getText(data, 'startYear')],
        endYear: [this.getText(data, 'endYear')],
        description: [this.getText(data, 'description')]
      })
    );
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  addSkill(data?: Record<string, unknown>): void {
    this.skills.push(
      this.fb.group({
        name: [this.getText(data, 'name')],
        level: [this.getNumber(data, 'level', 70)]
      })
    );
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  addLanguage(data?: Record<string, unknown>): void {
    this.languages.push(
      this.fb.group({
        name: [this.getText(data, 'name')],
        level: [this.getText(data, 'level', 'Intermedio')]
      })
    );
  }

  removeLanguage(index: number): void {
    this.languages.removeAt(index);
  }

  addProject(data?: Record<string, unknown>): void {
    this.projects.push(
      this.fb.group({
        name: [this.getText(data, 'name')],
        description: [this.getText(data, 'description')],
        technologies: [this.getText(data, 'technologies')],
        demoUrl: [this.getText(data, 'demoUrl')],
        repositoryUrl: [this.getText(data, 'repositoryUrl')],
        featured: [this.getBoolean(data, 'featured')]
      })
    );
  }

  removeProject(index: number): void {
    this.projects.removeAt(index);
  }

  savePortfolio(showConfirmation = true): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.portfolioForm.getRawValue())
    );

    if (showConfirmation) {
      this.showMessage('Cambios guardados correctamente');
    }
  }

  loadPortfolio(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedData = localStorage.getItem(this.storageKey);

    if (!savedData) {
      return;
    }

    try {
      const data = JSON.parse(savedData) as Partial<PortfolioData>;

      this.clearDynamicSections();

      this.portfolioForm.patchValue({
        fullName: data.fullName ?? '',
        professionalTitle: data.professionalTitle ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        location: data.location ?? '',
        website: data.website ?? '',
        linkedin: data.linkedin ?? '',
        github: data.github ?? '',
        summary: data.summary ?? '',
        availability: data.availability ?? '',
        profileImage: data.profileImage ?? ''
      });

      this.restoreArray(data.experiences, item =>
        this.addExperience(item)
      );

      this.restoreArray(data.education, item =>
        this.addEducation(item)
      );

      this.restoreArray(data.skills, item =>
        this.addSkill(item)
      );

      this.restoreArray(data.languages, item =>
        this.addLanguage(item)
      );

      this.restoreArray(data.projects, item =>
        this.addProject(item)
      );
    } catch (error) {
      console.error('No se pudo recuperar el portfolio:', error);
      localStorage.removeItem(this.storageKey);
    }
  }

  resetPortfolio(): void {
    if (
      isPlatformBrowser(this.platformId) &&
      !window.confirm(
        'Se eliminarán todos los datos guardados. ¿Quieres continuar?'
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
      profileImage: ''
    });

    this.createInitialItems();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }

    this.showMessage('Portfolio restablecido');
  }

  handleImageUpload(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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
      this.showMessage('Selecciona una imagen JPG, PNG o WebP');
      input.value = '';
      return;
    }

    const maximumSize = 2 * 1024 * 1024;

    if (file.size > maximumSize) {
      this.showMessage('La imagen debe ocupar menos de 2 MB');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.portfolioForm.controls.profileImage.setValue(
        String(reader.result)
      );

      this.savePortfolio(false);
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.portfolioForm.controls.profileImage.setValue('');
  }

  toggleEditor(): void {
    this.editorVisible = !this.editorVisible;
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    this.applyTheme();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(
        this.themeKey,
        this.darkMode ? 'dark' : 'light'
      );
    }
  }

  printPortfolio(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.savePortfolio(false);
    window.print();
  }

  selectSection(section: string): void {
    this.activeSection = section;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = this.document.getElementById(
      `editor-${section}`
    );

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private configureAutoSave(): void {
    this.portfolioForm.valueChanges
      .pipe(
        debounceTime(700),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.savePortfolio(false);
        this.savedMessage = 'Guardado automáticamente';
      });
  }

  private loadTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem(this.themeKey);

    this.darkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    this.document.documentElement.classList.toggle(
      'dark-theme',
      this.darkMode
    );
  }

  private createInitialItems(): void {
    if (this.experiences.length === 0) {
      this.addExperience();
    }

    if (this.education.length === 0) {
      this.addEducation();
    }

    if (this.skills.length === 0) {
      this.addSkill({
        name: 'Angular',
        level: 70
      });

      this.addSkill({
        name: 'TypeScript',
        level: 65
      });
    }

    if (this.languages.length === 0) {
      this.addLanguage({
        name: 'Español',
        level: 'Avanzado'
      });
    }

    if (this.projects.length === 0) {
      this.addProject();
    }
  }

  private clearDynamicSections(): void {
    this.experiences.clear();
    this.education.clear();
    this.skills.clear();
    this.languages.clear();
    this.projects.clear();
  }

  private restoreArray(
    value: unknown,
    callback: (item: Record<string, unknown>) => void
  ): void {
    if (!Array.isArray(value)) {
      return;
    }

    value.forEach(item => {
      if (item && typeof item === 'object') {
        callback(item as Record<string, unknown>);
      }
    });
  }

  private showMessage(message: string): void {
    this.savedMessage = message;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.setTimeout(() => {
      if (this.savedMessage === message) {
        this.savedMessage = '';
      }
    }, 3000);
  }

  private getText(
    data: Record<string, unknown> | undefined,
    key: string,
    fallback = ''
  ): string {
    const value = data?.[key];

    return typeof value === 'string' ? value : fallback;
  }

  private getBoolean(
    data: Record<string, unknown> | undefined,
    key: string
  ): boolean {
    return data?.[key] === true;
  }

  private getNumber(
    data: Record<string, unknown> | undefined,
    key: string,
    fallback: number
  ): number {
    const value = data?.[key];

    return typeof value === 'number' ? value : fallback;
  }
}
