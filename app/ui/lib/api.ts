// API_URL is a server-only runtime var (no NEXT_PUBLIC_ prefix).
// Inside Docker the ui container reaches the api service via http://api:5000.
// Locally (outside Docker) it falls back to http://localhost:5001.
const API_URL = process.env.API_URL ?? "http://localhost:5001";

export type Project = {
  id: number;
  title: string;
  creator: string;
  category: string;
  description: string;
  raised: number;
  goal: number;
  backers: number;
  days_left: number;
  badge?: string | null;
  front_pic?: string | null;
  redirect_link?: string | null;
  is_featured: boolean;
  is_recommended: boolean;
  is_popular: boolean;
};

async function fetchProjects(path: string): Promise<Project[]> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const getFeaturedProjects = () => fetchProjects("/projects/featured");
export const getRecommendedProjects = () => fetchProjects("/projects/recommended");
export const getPopularProjects = () => fetchProjects("/projects/popular");
export const getAllProjects = () => fetchProjects("/projects");
