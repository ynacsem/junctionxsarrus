"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const endpoints = [
  // --- CLIENTS ---
  {
    title: "Create Client",
    method: "POST",
    endpoint: "/api/v1/clients/",
    description: "Create a new client.",
    request: `{
  "client_id": "CLT0002",
  "preferred_location": "Algiers",
  "min_budget_DZD": 25000000,
  "max_budget_DZD": 45000000,
  "min_area": 120,
  "max_area": 200,
  "preferred_property_type": "house",
  "marital_status": "single",
  "has_kids": false
  // ...other fields
}`,
    response: `{
  "client_id": "CLT0002",
  ...
}`,
    code: `curl -X POST 'http://localhost:8000/api/v1/clients/' \
  -H 'Content-Type: application/json' \
  -d '{ ... }'

fetch('/api/v1/clients/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ... }) })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Get All Clients",
    method: "GET",
    endpoint: "/api/v1/clients/",
    description: "Retrieve a list of all clients with optional filters.",
    request: `?skip=0&limit=100&location=Algiers&property_type=apartment&min_budget=10000000&max_budget=50000000&has_kids=true&marital_status=single`,
    response: `[ { "client_id": "CLT0001", ... } ]`,
    code: `curl -X GET 'http://localhost:8000/api/v1/clients?limit=10&location=Algiers'

fetch('/api/v1/clients?limit=10&location=Algiers')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Get Client by ID",
    method: "GET",
    endpoint: "/api/v1/clients/{client_id}",
    description: "Retrieve a single client by their client_id.",
    request: ``,
    response: `{
  "client_id": "CLT0001",
  ...
}`,
    code: `curl -X GET 'http://localhost:8000/api/v1/clients/CLT0001'

fetch('/api/v1/clients/CLT0001')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Update Client",
    method: "PUT",
    endpoint: "/api/v1/clients/{client_id}",
    description: "Update an existing client.",
    request: `{
  "preferred_location": "Oran",
  ...
}`,
    response: `{
  "client_id": "CLT0001",
  ...
}`,
    code: `curl -X PUT 'http://localhost:8000/api/v1/clients/CLT0001' \
  -H 'Content-Type: application/json' \
  -d '{ ... }'

fetch('/api/v1/clients/CLT0001', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ... }) })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Delete Client",
    method: "DELETE",
    endpoint: "/api/v1/clients/{client_id}",
    description: "Delete a client by client_id. Use ?permanent=true for permanent delete.",
    request: `?permanent=true`,
    response: `{"message": "Client deleted"}`,
    code: `curl -X DELETE 'http://localhost:8000/api/v1/clients/CLT0001?permanent=true'

fetch('/api/v1/clients/CLT0001?permanent=true', { method: 'DELETE' })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  // --- PROPERTIES ---
  {
    title: "Create Property",
    method: "POST",
    endpoint: "/api/v1/properties/",
    description: "Create a new property.",
    request: `{
  "property_id": "PROP123",
  "location": "Algiers",
  "price_DZD": 25000000,
  "area": 120,
  "property_type": "apartment",
  "rooms": 3
  // ...other fields
}`,
    response: `{
  "property_id": "PROP123",
  ...
}`,
    code: `curl -X POST 'http://localhost:8000/api/v1/properties/' \
  -H 'Content-Type: application/json' \
  -d '{ ... }'

fetch('/api/v1/properties/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ... }) })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Get All Properties",
    method: "GET",
    endpoint: "/api/v1/properties/",
    description: "Retrieve a list of all properties with optional filters.",
    request: `?skip=0&limit=100&location=Algiers&property_type=apartment&min_price=10000000&max_price=50000000&min_area=50&max_area=200`,
    response: `[ { "property_id": "PROP123", ... } ]`,
    code: `curl -X GET 'http://localhost:8000/api/v1/properties?limit=10&location=Algiers'

fetch('/api/v1/properties?limit=10&location=Algiers')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Get Property by ID",
    method: "GET",
    endpoint: "/api/v1/properties/{property_id}",
    description: "Retrieve a single property by its property_id.",
    request: ``,
    response: `{
  "property_id": "PROP123",
  ...
}`,
    code: `curl -X GET 'http://localhost:8000/api/v1/properties/PROP123'

fetch('/api/v1/properties/PROP123')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Update Property",
    method: "PUT",
    endpoint: "/api/v1/properties/{property_id}",
    description: "Update an existing property.",
    request: `{
  "location": "Oran",
  ...
}`,
    response: `{
  "property_id": "PROP123",
  ...
}`,
    code: `curl -X PUT 'http://localhost:8000/api/v1/properties/PROP123' \
  -H 'Content-Type: application/json' \
  -d '{ ... }'

fetch('/api/v1/properties/PROP123', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ... }) })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Delete Property",
    method: "DELETE",
    endpoint: "/api/v1/properties/{property_id}",
    description: "Delete a property by property_id.",
    request: ``,
    response: `{"message": "Property deleted"}`,
    code: `curl -X DELETE 'http://localhost:8000/api/v1/properties/PROP123'

fetch('/api/v1/properties/PROP123', { method: 'DELETE' })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  // --- RECOMMENDATIONS ---
  {
    title: "Recommend Clients for a Property",
    method: "GET",
    endpoint: "/api/v1/recommendations/property/{property_id}",
    description: "Get recommended clients for a property.",
    request: ``,
    response: `{
  "matches": [ ... ]
}`,
    code: `curl -X GET 'http://localhost:8000/api/v1/recommendations/property/PROP123'

fetch('/api/v1/recommendations/property/PROP123')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Recommend Properties for a Client",
    method: "GET",
    endpoint: "/api/v1/recommendations/client/{client_id}",
    description: "Get recommended properties for a client.",
    request: ``,
    response: `{
  "client_id": "CLT0001",
  "recommended_properties": { ... }
}`,
    code: `curl -X GET 'http://localhost:8000/api/v1/recommendations/client/CLT0001'

fetch('/api/v1/recommendations/client/CLT0001')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Bulk Recommendations for Properties",
    method: "POST",
    endpoint: "/api/v1/recommendations/properties/",
    description: "Get recommendations for a list of properties.",
    request: `[
  { "location": "Bejaia", "price_DZD": 8500000, "area": 110, ... },
  ...
]`,
    response: `[ ... ]`,
    code: `curl -X POST 'http://localhost:8000/api/v1/recommendations/properties/' \
  -H 'Content-Type: application/json' \
  -d '[{ "location": "Bejaia", "price_DZD": 8500000, "area": 110, ... }]'

fetch('/api/v1/recommendations/properties/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([{ location: "Bejaia", price_DZD: 8500000, area: 110, ... }]) })
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Bulk Recommendations for All Properties",
    method: "GET",
    endpoint: "/api/v1/recommendations/properties/",
    description: "Get recommendations for all properties in the database.",
    request: ``,
    response: `[ ... ]`,
    code: `curl -X GET 'http://localhost:8000/api/v1/recommendations/properties/'

fetch('/api/v1/recommendations/properties/')
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    title: "Compare Two Properties",
    method: "POST",
    endpoint: "/api/v1/recommendations/compare-properties/",
    description: "Compare two properties and generate a PDF report.",
    request: `{
  "property_id_1": "PROP123",
  "property_id_2": "PROP456"
}`,
    response: `PDF file (application/pdf)`,
    code: `curl -X POST 'http://localhost:8000/api/v1/recommendations/compare-properties/' \
  -H 'Content-Type: application/json' \
  -d '{ "property_id_1": "PROP123", "property_id_2": "PROP456" }' --output comparison.pdf

fetch('/api/v1/recommendations/compare-properties/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ property_id_1: "PROP123", property_id_2: "PROP456" }) })
  .then(res => res.blob())
  .then(blob => { /* handle blob */ });`
  },
];

export default function ApiDocumentationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
      <p className="mb-8 text-muted-foreground">Comprehensive documentation for all backend API endpoints. Each section includes the method, endpoint, description, request, response, and code examples.</p>
      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <Card key={idx} className="border-2 border-blue-200 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>{ep.title}</CardTitle>
              <CardDescription>{ep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2"><strong>Method:</strong> <code>{ep.method}</code></div>
              <div className="mb-2"><strong>Endpoint:</strong> <code>{ep.endpoint}</code></div>
              {ep.request && (
                <div className="mb-2">
                  <strong>Request:</strong>
                  <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">{ep.request}</pre>
                </div>
              )}
              <div className="mb-2">
                <strong>Response:</strong>
                <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">{ep.response}</pre>
              </div>
              <div>
                <strong>Code Example:</strong>
                <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">{ep.code}</pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
