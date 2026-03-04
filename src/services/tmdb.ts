import { TMDBSearchResult, TMDBMovie } from '../types';

const API_KEY = '3c73ccecb524bad4389467af2039d1ce';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const TMDB_CONFIG = {
  posterSizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  baseUrl: IMAGE_BASE_URL,
};

export const getPosterUrl = (path: string | null, size: string = 'w342'): string | null => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const searchMovies = async (query: string, page: number = 1): Promise<TMDBSearchResult> => {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=zh-CN`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data: TMDBSearchResult = await response.json();
  return data;
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=zh-CN`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data: TMDBMovie = await response.json();
  return data;
};

export const getPopularMovies = async (page: number = 1): Promise<TMDBSearchResult> => {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=zh-CN`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data: TMDBSearchResult = await response.json();
  return data;
};
