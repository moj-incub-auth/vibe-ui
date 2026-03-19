export type SearchRequest = {
  message: string;
};

export type SearchResponse = {
  message: string;
  components: Component[];
};

export type ComponentCategory =
  | "component"
  | "pattern"
  | "page"
  | "service-pattern"
  | "style-guide";

export type Component = {
  title: string;
  url: string;
  description: string;
  parent: string;
  category: ComponentCategory;
  accessability: string;
  created_at: string;
  updated_at: string;
  has_research: boolean;
  views: number;
};
