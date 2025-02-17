import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface UseSupabaseOptions<T> {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
}

export function useSupabaseQuery<T>({
  table,
  select = '*',
  filters = {},
  orderBy,
}: UseSupabaseOptions<T>) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase
          .from(table)
          .select(select);

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, {
            ascending: orderBy.ascending ?? true,
          });
        }

        const { data: result, error } = await query;

        if (error) throw error;
        setData(result as T[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy)]);

  return { data, error, loading, supabase };
}

export function useSupabaseMutation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insert = async (table: string, data: Partial<T>) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      if (error) throw error;
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (table: string, id: string | number, data: Partial<T>) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (table: string, id: string | number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    insert,
    update,
    remove,
    loading,
    error,
  };
} 