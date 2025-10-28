const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

interface MovieDetails extends Movie {
  credits?: {
    cast: Array<{ name: string; character: string; profile_path: string | null }>;
    crew: Array<{ name: string; job: string }>;
  };
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  seasons?: number;
  number_of_episodes?: number;
}

// 인기 영화 가져오기
export async function getTrendingMovies(page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
}

// 인기 드라마 가져오기
export async function getTrendingTV(page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending TV:', error);
    return [];
  }
}

// 영화 검색
export async function searchMovies(query: string, page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

// 영화 상세 정보
export async function getMovieDetails(id: number, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

// 추천 작품
export async function getRecommendations(id: number, type: 'movie' | 'tv' = 'movie'): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

// 장르별 영화
export async function getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
}

// 최고 평점 영화
export async function getTopRatedMovies(page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
}

// 포스터 이미지 URL 생성
export function getPosterUrl(posterPath: string | null, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!posterPath) {
    return '/placeholder.png';
  }
  const sizes = {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
  };
  return `https://image.tmdb.org/t/p/${sizes[size]}${posterPath}`;
}

// 배경 이미지 URL 생성
export function getBackdropUrl(backdropPath: string | null, size: 'small' | 'large' = 'small'): string {
  if (!backdropPath) {
    return '/placeholder.png';
  }
  const sizes = {
    small: 'w780',
    large: 'w1280',
  };
  return `https://image.tmdb.org/t/p/${sizes[size]}${backdropPath}`;
}
