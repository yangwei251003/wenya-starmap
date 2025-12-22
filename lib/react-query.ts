import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (previously cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Query Keys
export const queryKeys = {
  studyQueue: (userId: string) => ['studyQueue', userId],
  studyStats: (userId: string) => ['studyStats', userId],
  memoryData: (userId: string) => ['memoryData', userId],
  userSettings: (userId: string) => ['userSettings', userId],
} as const