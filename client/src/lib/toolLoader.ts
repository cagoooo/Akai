import type { EducationalTool } from './data';

/** Direct entries fetch one record; home navigation reuses its catalogue. */
export async function loadTool(id: number, cached?: EducationalTool[]): Promise<EducationalTool | null> {
  if (cached) return cached.find(t => t.id === id) ?? null;
  const base = import.meta.env.BASE_URL;
  const version = import.meta.env.VITE_APP_VERSION;
  const response = await fetch(`${base}api/tools/${id}.json?v=${version}`);
  if (response.ok) return await response.json() as EducationalTool;
  if (response.status !== 404) throw new Error('無法獲取工具數據');
  // Development and older deployments may only have the full catalogue.
  const catalogue = await fetch(`${base}api/tools.json?v=${version}`);
  if (!catalogue.ok) throw new Error('無法獲取工具數據');
  const tools = await catalogue.json() as EducationalTool[];
  return tools.find(t => t.id === id) ?? null;
}
