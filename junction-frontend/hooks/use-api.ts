import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Client, Property, ClientCreate, PropertyCreate, ClientUpdate, PropertyUpdate, Recommendation } from '@/lib/types';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiStateList<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useApiState<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, loading: false, error: null });
  }, []);

  return { state, setLoading, setError, setData };
}

export function useApiStateList<T>() {
  const [state, setState] = useState<ApiStateList<T>>({
    data: [],
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setData = useCallback((data: T[]) => {
    setState({ data, loading: false, error: null });
  }, []);

  return { state, setLoading, setError, setData };
}

// Custom hooks for specific API operations
export function useClients() {
  const { state, setLoading, setError, setData } = useApiStateList<Client>();

  const fetchClients = useCallback(async (params?: {
    skip?: number;
    limit?: number;
    location?: string;
    property_type?: string;
    min_budget?: number;
    max_budget?: number;
    has_kids?: boolean;
    marital_status?: string;
  }) => {
    try {
      setLoading(true);
      const clients = await apiClient.getClients(params);
      setData(clients);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch clients');
    }
  }, [setLoading, setError, setData]);

  const createClient = useCallback(async (client: ClientCreate) => {
    try {
      setLoading(true);
      const newClient = await apiClient.createClient(client);
      setData([...state.data, newClient]);
      return newClient;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create client');
      throw error;
    }
  }, [state.data, setLoading, setError, setData]);

  const updateClient = useCallback(async (id: number, client: ClientUpdate) => {
    try {
      setLoading(true);
      const updatedClient = await apiClient.updateClient(id, client);
      setData(state.data.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update client');
      throw error;
    }
  }, [state.data, setLoading, setError, setData]);

  const deleteClient = useCallback(async (id: number, permanent: boolean = false) => {
    try {
      setLoading(true);
      await apiClient.deleteClient(id, permanent);
      setData(state.data.filter(c => c.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete client');
      throw error;
    }
  }, [state.data, setLoading, setError, setData]);

  return {
    clients: state.data,
    loading: state.loading,
    error: state.error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useProperties() {
  const { state, setLoading, setError, setData } = useApiStateList<Property>();

  const fetchProperties = useCallback(async (params?: {
    skip?: number;
    limit?: number;
    location?: string;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
  }) => {
    try {
      setLoading(true);
      const properties = await apiClient.getProperties(params);
      setData(properties);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch properties');
    }
  }, [setLoading, setError, setData]);

  const createProperty = useCallback(async (property: PropertyCreate) => {
    try {
      setLoading(true);
      const newProperty = await apiClient.createProperty(property);
      setData([...state.data, newProperty]);
      return newProperty;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create property');
      throw error;
    }
  }, [state.data, setLoading, setError, setData]);

  const updateProperty = useCallback(async (propertyId: string, property: PropertyUpdate) => {
    try {
      setLoading(true);
      const updatedProperty = await apiClient.updateProperty(propertyId, property);
      setData(state.data.map(p => p.property_id === propertyId ? updatedProperty : p));
      return updatedProperty;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update property');
      throw error;
    }
  }, [state.data, setLoading, setError, setData]);

  const deleteProperty = useCallback(async (propertyId: string) => {
    try {
      setLoading(true);
      await apiClient.deleteProperty(propertyId);
      setData(state.data.filter(p => p.property_id !== propertyId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete property');
      throw error;
    }
  }, [state.data, setLoading, setError, setData]);

  return {
    properties: state.data,
    loading: state.loading,
    error: state.error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

export function useClient() {
  const { state, setLoading, setError, setData } = useApiState<Client>();

  const fetchClient = useCallback(async (client_id: string) => {
    try {
      setLoading(true);
      const client = await apiClient.getClient(client_id);
      setData(client);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch client');
    }
  }, [setLoading, setError, setData]);

  return {
    client: state.data,
    loading: state.loading,
    error: state.error,
    fetchClient,
  };
}

export function useProperty() {
  const { state, setLoading, setError, setData } = useApiState<Property>();

  const fetchProperty = useCallback(async (propertyId: string) => {
    try {
      setLoading(true);
      const property = await apiClient.getProperty(propertyId);
      setData(property);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch property');
    }
  }, [setLoading, setError, setData]);

  return {
    property: state.data,
    loading: state.loading,
    error: state.error,
    fetchProperty,
  };
}

export function usePropertyRecommendations() {
  const { state, setLoading, setError, setData } = useApiStateList<Recommendation>();

  const fetchRecommendations = useCallback(async (propertyId: string) => {
    try {
      setLoading(true);
      const recommendations = await apiClient.getRecommendationsForProperty(propertyId);
      setData(recommendations);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch property recommendations');
    }
  }, [setLoading, setError, setData]);

  return {
    recommendations: state.data,
    loading: state.loading,
    error: state.error,
    fetchRecommendations,
  };
} 