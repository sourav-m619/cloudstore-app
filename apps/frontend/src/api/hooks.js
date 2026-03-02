import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./client";

// ── Products ─────────────────────────────────────────
export const useProducts = (filters = {}) =>
  useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: filters });
      return data;
    },
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => { const { data } = await api.get(`/products/${id}`); return data.data; },
    enabled: !!id,
  });

// ── Orders ───────────────────────────────────────────
export const useOrders = (filters = {}) =>
  useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const { data } = await api.get("/orders", { params: filters });
      return data;
    },
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderData) => {
      const { data } = await api.post("/orders", orderData);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(["orders"]);
      qc.invalidateQueries(["products"]); // stock updated
    },
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries(["orders"]),
  });
};

// ── Health ───────────────────────────────────────────
export const useHealth = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await api.get("/../../health/ready");
      return data;
    },
    refetchInterval: 30000,
    retry: false,
  });
