export interface MovieTicket {
  id: string;
  movieTitle: string;
  originalTitle?: string;
  tmdbId?: number;
  posterUrl: string;
  dateTime: string;
  location: string;
  peopleCount: number;
  price: number;
  thoughts: string;
  userImages: string[];
  createdAt: number;
  isFavorite?: boolean;
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

export interface Feedback {
  id: string;
  content: string;
  createdAt: number;
}
