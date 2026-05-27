export interface Article {
    id: string;
    category: 'News' | 'Tips' | 'Advice' | 'Books' | 'Learning';
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    tags: string[];
    image: string;
    featured: boolean;
}

export interface NewsDataResponse {
    categories: string[];
    articles: Article[];
}

export type NewsCategory = 'All' | 'News' | 'Tips' | 'Advice' | 'Books' | 'Learning';
