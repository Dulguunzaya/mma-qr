export type Attachment = {
  url?: string | null;
};

export type Page = {
  _id: string;
  name?: string;
  slug?: string;
  description?: string;
  content?: string;
  thumbnail?: Attachment;
  customFieldsData?: Array<{ field?: string; value?: unknown }>;
  customFieldsMap?: Record<string, unknown>;
};

export type Post = {
  _id: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  publishedDate?: string;
  createdAt?: string;
  tagIds?: string[];
  thumbnail?: Attachment;
  images?: Attachment[];
  customFieldsData?: Record<string, unknown>;
  customFieldsMap?: Record<string, unknown>;
};

export type MenuItem = {
  _id: string;
  parentId?: string;
  label?: string;
  url?: string;
  order?: number;
  target?: string;
};

export type PostCategory = {
  _id: string;
  slug?: string;
};

export type Product = {
  _id: string;
  name?: string;
  code?: string;
  unitPrice?: number;
  currency?: string;
};
