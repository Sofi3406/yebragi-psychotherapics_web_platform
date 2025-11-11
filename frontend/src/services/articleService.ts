import api from './api';

export interface Article {
  id: number;
  title: string;
  url: string;
  content?: string;
  siteKey?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const articleService = {
  list: async () => {
    const response = await api.get<{ articles: Article[]; pagination: any }>('/api/v1/articles');
    return response.data.articles;
  },

  getOne: async (id: number) => {
    const response = await api.get<Article>(`/api/v1/articles/${id}`);
    return response.data;
  },
};



