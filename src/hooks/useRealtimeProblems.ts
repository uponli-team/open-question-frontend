"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Problem } from "@/types/problem";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";
import { listProblems } from "@/lib/api";

export type UseRealtimeProblemsParams = {
  page?: number;
  limit?: number;
  query?: string;
  field?: string;
};

export function useRealtimeProblems(params?: UseRealtimeProblemsParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const query = params?.query ?? "";
  const field = params?.field ?? "";

  const [items, setItems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProblems({
        page,
        limit,
        query: query || undefined,
        field: field || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setFields(res.fields);
    } finally {
      setLoading(false);
    }
  }, [page, limit, query, field]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Fallback realtime: when using mock mode, listen for upload events.
    if (!isSupabaseConfigured()) {
      const handler = () => void refresh();
      window.addEventListener("oqd:problems_updated", handler);
      unsubscribe = () => window.removeEventListener("oqd:problems_updated", handler);
      return () => unsubscribe?.();
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("oqd-problems-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "problems" },
        () => void refresh(),
      )
      .subscribe();

    unsubscribe = () => {
      supabase.removeChannel(channel);
    };

    return () => unsubscribe?.();
  }, [refresh]);

  return useMemo(
    () => ({
      items,
      total,
      page,
      limit,
      totalPages,
      fields,
      loading,
      refresh,
    }),
    [items, total, page, limit, totalPages, fields, loading, refresh],
  );
}

