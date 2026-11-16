import { useQuery } from '@tanstack/react-query';
import { Overview } from '@panel/contracts';
import { get } from './api';

// Shared by every page: the header badge and the run tags all read the same overview.
export const overviewKey = ['overview'] as const;
export const useOverview = () => useQuery({ queryKey: overviewKey, queryFn: () => get('/overview', Overview), refetchInterval: 60_000 });
