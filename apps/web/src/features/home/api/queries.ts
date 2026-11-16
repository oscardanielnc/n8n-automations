import { useQuery } from '@tanstack/react-query';
import { JobRadar, ServerHealth, Vigia } from '@panel/contracts';
import { get } from '../../../lib/api';

export const useVigia = () => useQuery({ queryKey: ['vigia'], queryFn: () => get('/vigia', Vigia) });
export const useJobRadar = () => useQuery({ queryKey: ['jobs'], queryFn: () => get('/jobs', JobRadar) });
export const useServerHealth = () => useQuery({ queryKey: ['server'], queryFn: () => get('/server', ServerHealth) });
