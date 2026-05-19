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
  playersJoined?: number;
  maxPlayers?: number;
  capacity?: number;
  comments?: MatchComment[];
  commentCount?: number;
  matchState?: string;
  userJoined?: boolean;
  reserveSlots?: number;
  reservedSlots?: number;
  joins?: MatchJoin[];
  players?: {
    id?: string;
    name?: string;
    email?: string;
    isReserve?: boolean;
  }[];
}

export interface MatchJoin {
  userId?: string | number;
  extraSlots?: number;
  joinedAt?: string;
  user?: {
    id?: string | number;
    name?: string;
    email?: string;
  };
}

export interface MatchActionResponse {
  match?: MatchItem;
  data?: MatchItem;
  item?: MatchItem;
  result?: MatchItem;
  success?: boolean;
  extraSlots?: number;
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

export interface MatchActionResult {
  match: MatchItem;
}

export interface MatchComment {
  id?: string;
  text?: string;
  createdAt?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
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

function normalizeMatchItem(response: MatchItem | MatchActionResponse | null | undefined): MatchItem | null {
  if (!response) {
    return null;
  }

  const match = 'id' in response
    ? response as MatchItem
    : response.match || response.data || response.item || response.result || null;

  if (!match) {
    return null;
  }

  const joins = match.joins ?? [];
  const players = match.players ?? joins.map((join) => ({
    id: join.user?.id ? String(join.user.id) : join.userId ? String(join.userId) : undefined,
    name: join.user?.name,
    email: join.user?.email,
    isReserve: false,
  }));

  return {
    ...match,
    id: String(match.id),
    startsAt: match.startsAt ?? (match as MatchItem & { date?: string }).date,
    maxPlayers: match.maxPlayers ?? match.capacity,
    joinedPlayers: match.joinedPlayers ?? match.playersJoined,
    players,
  };
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

async function requestMatchItem(endpoint: string, init?: RequestInit): Promise<MatchItem | MatchActionResponse | null> {
  try {
    return await apiCall<MatchItem | MatchActionResponse>(endpoint, {
      method: init?.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | undefined,
      headers: init?.headers as Record<string, string> | undefined,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('404')) {
      return null;
    }

    throw error;
  }
}

function normalizeMatchActionResponse(response: MatchItem | MatchActionResponse | null | undefined) {
  return normalizeMatchItem(response) ?? null;
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

export async function getMatchById(matchId: string): Promise<MatchItem | null> {
  const endpoints = [
    `/matches/${matchId}`,
    `/match/${matchId}`,
    `/matches?id=${encodeURIComponent(matchId)}`,
  ];

  for (const endpoint of endpoints) {
    const response = await requestMatchItem(endpoint);
    const match = normalizeMatchActionResponse(response);

    if (match) {
      return match;
    }
  }

  return null;
}

export async function joinMatch(matchId: string, reserveSlots = 0): Promise<MatchItem> {
  const endpoints = [
    { endpoint: `/matches/${matchId}/join`, method: 'POST' },
  ];

  for (const candidate of endpoints) {
    await requestMatchItem(candidate.endpoint, {
      method: candidate.method,
      body: JSON.stringify({ extraSlots: reserveSlots }),
    });

    if (reserveSlots > 0) {
      await updateReserveSlots(matchId, reserveSlots);
    }

    const match = await getMatchById(matchId);
    if (match) {
      return match;
    }

    throw new Error('Unable to load match details after joining.');
  }

  throw new Error('Unable to join this match.');
}

export async function leaveMatch(matchId: string): Promise<MatchItem> {
  const endpoints = [
    { endpoint: `/matches/${matchId}/leave`, method: 'POST' },
  ];

  for (const candidate of endpoints) {
    await requestMatchItem(candidate.endpoint, {
      method: candidate.method,
    });

    const match = await getMatchById(matchId);
    if (match) {
      return match;
    }

    throw new Error('Unable to load match details after leaving.');
  }

  throw new Error('Unable to leave this match.');
}

export async function updateReserveSlots(matchId: string, reserveSlots: number): Promise<MatchItem> {
  const endpoints = [
    { endpoint: `/matches/${matchId}/slots`, method: 'POST' },
  ];

  for (const candidate of endpoints) {
    await requestMatchItem(candidate.endpoint, {
      method: candidate.method,
      body: JSON.stringify({ extraSlots: reserveSlots }),
    });

    const match = await getMatchById(matchId);
    if (match) {
      return match;
    }
  }

  throw new Error('Unable to update reserve slots.');
}
