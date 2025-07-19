import {
  Client,
  ClientCreate,
  ClientUpdate,
  Property,
  PropertyCreate,
  PropertyUpdate,
  Recommendation,
  PropertyRecommendation,
  ApiResponse
} from './types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    responseType: "json" | "blob" = "json"
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log('API Request:', url); // Debug log

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      console.log('API Response Status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let message = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
        if (Array.isArray(errorData.detail)) {
          message = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (Array.isArray(errorData)) {
          message = errorData.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        }
        throw new Error(message);
      }

      if (responseType === "blob") {
        return (await response.blob()) as any;
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Test endpoint
  async testConnection(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/test');
  }

  // Test database connection
  async testDatabaseConnection(): Promise<any> {
    return this.request('/clients/?limit=1');
  }

  // Client endpoints
  async getClients(params?: {
    skip?: number;
    limit?: number;
    location?: string;
    property_type?: string;
    min_budget?: number;
    max_budget?: number;
    has_kids?: boolean;
    marital_status?: string;
    client_id?: string;
  }): Promise<Client[]> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/clients/?${queryString}` : '/clients/';

    return this.request<Client[]>(endpoint);
  }

  async getClient(client_id: string): Promise<Client> {
    return this.request<Client>(`/clients/${client_id}`);
  }

  async createClient(client: ClientCreate): Promise<Client> {
    return this.request<Client>('/clients/', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: number, client: ClientUpdate): Promise<Client> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: number, permanent: boolean = false): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/clients/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    });
  }

  // Property endpoints
  async getProperties(params?: {
    skip?: number;
    limit?: number;
    location?: string;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
  }): Promise<Property[]> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/properties/?${queryString}` : '/properties/';

    return this.request<Property[]>(endpoint);
  }

  async getProperty(propertyId: string): Promise<Property> {
    return this.request<Property>(`/properties/${propertyId}`);
  }

  async createProperty(property: PropertyCreate): Promise<Property> {
    return this.request<Property>('/properties/', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  }

  async updateProperty(propertyId: string, property: PropertyUpdate): Promise<Property> {
    return this.request<Property>(`/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  }

  async deleteProperty(propertyId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/properties/${propertyId}`, {
      method: 'DELETE',
    });
  }

  // Recommendation endpoints
  async getRecommendationsForProperty(propertyId: string): Promise<Recommendation[]> {
    return this.request<Recommendation[]>(`/recommendations/property/${propertyId}`);
  }

  async getRecommendationsForClient(clientId: string): Promise<{
    client_id: string;
    recommended_properties: PropertyRecommendation[];
  }> {
    return this.request<{
      client_id: string;
      recommended_properties: PropertyRecommendation[];
    }>(`/recommendations/client/${clientId}`);
  }

  async getBulkRecommendationsForProperties(properties: Array<{
    location: string;
    price_DZD: number;
    area: number;
    property_type: string;
    rooms: number;
    schools_nearby?: number;
    hospitals_nearby?: number;
    parks_nearby?: number;
    public_transport_score?: number;
  }>): Promise<any> {
    return this.request('/recommendations/properties/', {
      method: 'POST',
      body: JSON.stringify(properties),
    });
  }

  async getAllPropertiesRecommendations(): Promise<any> {
    return this.request('/recommendations/properties/');
  }

  async compareProperties(house1: any, house2: any): Promise<any> {
    return this.request('/recommendations/compare-properties/', {
      method: 'POST',
      body: JSON.stringify({ house1, house2 }),
    });
  }

  async comparePropertiesById(propertyId1: string, propertyId2: string): Promise<Blob> {
    // Adjust endpoint and payload as needed for your backend
    return this.request(
      `/recommendations/compare-properties/`,
      {
        method: 'POST',
        body: JSON.stringify({ property_id_1: propertyId1, property_id_2: propertyId2 }),
        headers: { 'Content-Type': 'application/json' },
      },
      "blob"
    );
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };