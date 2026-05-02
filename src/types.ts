export type TaxonomyNode = {
  id: string;
  name: string;
  en: string;
  children?: TaxonomyNode[];
};

export type Paper = {
  id: string;
  title: string;
  conference: string;
  year: number;
  category: string;
  categoryId: string;
  path: string;
  tags: string[];
  summary: string;
  paperUrl?: string;
  codeUrl?: string;
  codeNote?: string;
  noteUrl?: string;
  sourcePath?: string;
};
