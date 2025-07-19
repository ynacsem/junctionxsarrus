export interface Client {
  id: number;
  client_id: string;
  preferred_location: string;
  min_budget_DZD: number;
  max_budget_DZD: number;
  min_area: number;
  max_area: number;
  preferred_property_type: string;
  marital_status: string;
  has_kids: boolean;
  weight_location?: number;
  weight_property_type?: number;
  preferred_rooms?: number;
  weight_rooms?: number;
  preferred_schools_nearby?: number;
  weight_schools_nearby?: number;
  preferred_hospitals_nearby?: number;
  weight_hospitals_nearby?: number;
  preferred_parks_nearby?: number;
  weight_parks_nearby?: number;
  preferred_public_transport_score?: number;
  weight_public_transport_score?: number;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface ClientCreate {
  client_id: string;
  preferred_location: string;
  min_budget_DZD: number;
  max_budget_DZD: number;
  min_area: number;
  max_area: number;
  preferred_property_type: string;
  marital_status: string;
  has_kids: boolean;
  weight_location?: number;
  weight_property_type?: number;
  preferred_rooms?: number;
  weight_rooms?: number;
  preferred_schools_nearby?: number;
  weight_schools_nearby?: number;
  preferred_hospitals_nearby?: number;
  weight_hospitals_nearby?: number;
  preferred_parks_nearby?: number;
  weight_parks_nearby?: number;
  preferred_public_transport_score?: number;
  weight_public_transport_score?: number;
}

export interface ClientUpdate {
  client_id?: string;
  preferred_location?: string;
  min_budget_DZD?: number;
  max_budget_DZD?: number;
  min_area?: number;
  max_area?: number;
  preferred_property_type?: string;
  marital_status?: string;
  has_kids?: boolean;
  weight_location?: number;
  weight_property_type?: number;
  preferred_rooms?: number;
  weight_rooms?: number;
  preferred_schools_nearby?: number;
  weight_schools_nearby?: number;
  preferred_hospitals_nearby?: number;
  weight_hospitals_nearby?: number;
  preferred_parks_nearby?: number;
  weight_parks_nearby?: number;
  preferred_public_transport_score?: number;
  weight_public_transport_score?: number;
}

export interface Property {
  id: number;
  property_id: string;
  location: string;
  price_DZD: number;
  area: number;
  property_type: string;
  rooms: number;
  schools_nearby?: number;
  hospitals_nearby?: number;
  parks_nearby?: number;
  public_transport_score?: number;
}

export interface PropertyCreate {
  property_id: string;
  location: string;
  price_DZD: number;
  area: number;
  property_type: string;
  rooms: number;
  schools_nearby?: number;
  hospitals_nearby?: number;
  parks_nearby?: number;
  public_transport_score?: number;
}

export interface PropertyUpdate {
  location?: string;
  price_DZD?: number;
  area?: number;
  property_type?: string;
  rooms?: number;
  schools_nearby?: number;
  hospitals_nearby?: number;
  parks_nearby?: number;
  public_transport_score?: number;
}

export interface Recommendation {
  client_id?: string;
  preferred_location?: string;
  distance_km?: number;
  confidence_model?: number;
  confidence_distance?: number;
  confidence?: number;
  explanations?: string[];
  buyer_details?: {
    budget_range?: string;
    area_range?: string;
    property_type?: string;
    marital_status?: string;
    has_kids?: boolean;
  };
  price?: number;
  // Add any other fields as needed
}

export interface PropertyRecommendation {
  property_id: string;
  score: number;
  explanation: string;
  match_details: {
    location_match: number;
    budget_match: number;
    area_match: number;
    property_type_match: number;
    model_probability: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}