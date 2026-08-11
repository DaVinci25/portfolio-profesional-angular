export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  currentJob: boolean;
  description: string;
  visible: boolean;
}

export interface Education {
  institution: string;
  qualification: string;
  specialization: string;
  startYear: string;
  endYear: string;
  description: string;
  visible: boolean;
}

export interface Skill {
  name: string;
  level: number;
  visible: boolean;
}

export interface Language {
  name: string;
  level: string;
  visible: boolean;
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  demoUrl: string;
  repositoryUrl: string;
  image: string;
  featured: boolean;
  visible: boolean;
}

export interface PortfolioSettings {
  template: 'professional' | 'technology' | 'creative';
  primaryColor: string;
  darkMode: boolean;
  showPhoto: boolean;
}

export interface Portfolio {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  availability: string;
  summary: string;
  profileImage: string;

  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];

  settings: PortfolioSettings;
  updatedAt: string;
}