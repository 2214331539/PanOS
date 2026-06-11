import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/lib/api/client";

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
}

export function useCalendarEvents(month: string) {
  return useQuery({
    queryKey: ["calendar", month],
    queryFn: async () =>
      (await apiGet<CalendarEvent[]>(`/calendar?month=${encodeURIComponent(month)}`)).data,
    staleTime: 30_000,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { date: string; title: string }) =>
      (await apiSend<CalendarEvent>("/admin/calendar", "POST", input, { auth: true })).data,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["calendar"] }),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiSend(`/admin/calendar/${id}`, "DELETE", undefined, { auth: true });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["calendar"] }),
  });
}
