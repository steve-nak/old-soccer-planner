import { apiCall } from '@/services/api';

export interface MatchItem {
  id: string;
  title?: string;
  homeTeam?: string;
  awayTeam?: string;
  venue?: string;
  startsAt?: string;
  startTime?: string;
  status?: string;
  competition?: string;
  round?: string;
  location?: string;
  score?: string;
  joinedPlayers?: number;
  maxPlayers?: number;
}

export interface MatchPageResponse {
  items?: MatchItem[];
  data?: MatchItem[];
  results?: MatchItem[];
  matches?: MatchItem[];
  total?: number;
  page?: number;
  limit?: number;
  pageSize?: number;
  hasMore?: boolean;
  nextPage?: number | null;
  pagination?: {
    page?: number;
    totalPages?: number;
    hasMore?: boolean;
    nextPage?: number | null;
  };
}

export interface MatchPage {
  items: MatchItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function normalizeMatchItems(response: MatchPageResponse | MatchItem[] | null | undefined): MatchItem[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  return response.items || response.data || response.results || response.matches || [];
}

function toBooleanHasMore(response: MatchPageResponse | MatchItem[] | null | undefined, items: MatchItem[], pageSize: number) {
  if (!response || Array.isArray(response)) {
    return items.length === pageSize;
  }

  if (typeof response.hasMore === 'boolean') {
    return response.hasMore;
  }

  if (typeof response.nextPage === 'number') {
    return response.nextPage > 0;
  }

  if (response.pagination) {
    if (typeof response.pagination.hasMore === 'boolean') {
      return response.pagination.hasMore;
    }

    if (typeof response.pagination.nextPage === 'number') {
      return response.pagination.nextPage > 0;
    }

    if (typeof response.pagination.totalPages === 'number' && typeof response.pagination.page === 'number') {
      return response.pagination.page < response.pagination.totalPages;
    }
  }

  return items.length === pageSize;
}

async function requestMatchPage(endpoint: string): Promise<MatchPageResponse | MatchItem[] | null> {
  try {
    return await apiCall<MatchPageResponse | MatchItem[]>(endpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('404')) {
      return null;
    }

    throw error;
  }
}

export async function getActiveMatchesPage(page: number, pageSize: number): Promise<MatchPage> {
  const endpoints = [
    `/matches?status=active&page=${page}&limit=${pageSize}`,
    `/matches/active?page=${page}&limit=${pageSize}`,
  ];

  let response: MatchPageResponse | MatchItem[] | null = null;

  for (const endpoint of endpoints) {
    response = await requestMatchPage(endpoint);
    if (response) {
      break;
    }
  }

  const items = normalizeMatchItems(response);
  const responsePage = response && !Array.isArray(response) ? response.page : undefined;
  const responsePageSize = response && !Array.isArray(response) ? (response.limit || response.pageSize) : undefined;

  return {
    items,
    page: responsePage || page,
    pageSize: responsePageSize || pageSize,
    hasMore: toBooleanHasMore(response, items, pageSize),
  };
}
