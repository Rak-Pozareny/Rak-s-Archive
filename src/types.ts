export type ProjectStatus =
  | "active"
  | "completed"
  | "archived"
  | "experiment"
  | "on-hold";

export type Category =
  | "Hardware"
  | "Software"
  | "Mechanical"
  | "Electronics"
  | "Engineering"
  | "Experiments"
  | "Research"
  | "Design"
  | "Programming"
  | "Other";

export interface PostImage {
  id: string;
  /** base64 data URL or remote URL */
  src: string;
  caption?: string;
  alt?: string;
}

export interface Post {
  id: string;
  projectNumber: number;
  revision: string;
  title: string;
  /** ISO date string, e.g. 2026-09-01 */
  date: string;
  category: Category;
  excerpt: string;
  /** Markdown content */
  content: string;
  featuredImage?: PostImage;
  images: PostImage[];
  tags: string[];
  projectStatus: ProjectStatus;
  isDemo?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type BackgroundMode = "solid" | "gradient" | "image" | "blueprint" | "paper";

export interface BackgroundSettings {
  mode: BackgroundMode;
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  imageSrc?: string;
  imagePosition: string;
  imageSize: string;
  imageOpacity: number;
  overlayOpacity: number;
}

export interface MusicSettings {
  enabled: boolean;
  trackSrc?: string;
  trackName?: string;
  defaultVolume: number;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  archiveLabel: string;
  background: BackgroundSettings;
  music: MusicSettings;
  categories: Category[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Your Name",
  tagline: "Engineering projects, experiments, and things I build.",
  archiveLabel: "PERSONAL ENGINEERING ARCHIVE",
  background: {
    mode: "blueprint",
    solidColor: "#F2EFE7",
    gradientFrom: "#F2EFE7",
    gradientTo: "#E8E3D6",
    imagePosition: "center",
    imageSize: "cover",
    imageOpacity: 1,
    overlayOpacity: 0.85,
  },
  music: {
    enabled: false,
    defaultVolume: 0.2,
  },
  categories: [
    "Hardware",
    "Software",
    "Mechanical",
    "Electronics",
    "Engineering",
    "Experiments",
    "Research",
    "Design",
    "Programming",
    "Other",
  ],
};
