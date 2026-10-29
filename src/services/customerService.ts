import { API_ROUTES } from "@/constants/ApiRoutes";


export interface CustomerFilters {
  City?: string;
  Location?: string;
  CustomerType?: string;
  CustomerSubType?: string;
  Campaign?: string;
  LeadTemperature?: string;
  StatusType?: string;
  LeadType?: string;
  Keyword?: string;
  ContactNumber?: string;
  ReferenceId?: string;
  MinPrice?: string;
  MaxPrice?: string;
  Price?: string;
  isFavourite?: boolean;
  StartDate?: string;
  EndDate?: string;
  Limit?: number;
  Skip?: number;
  sort?: string;
  User?: string;
  CustomerFields?: Record<string, string>;
}

export async function getCustomers(filters: CustomerFilters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (key === "CustomerFields") {
      params.set(key, JSON.stringify(value));
    } else {
      params.set(key, String(value));
    }
  });

  const url = API_ROUTES.CUSTOMER.GET_BY_PARAMS(params.toString());

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch customers: ${response.status}`);
  }

  const customers = await response.json();

  return {
    customers,
    totalRecords: Number(
      response.headers.get("X-Total-Count") ?? customers.length
    ),
  };
}



export type CustomerActionPayload = {
  isFavourite?: boolean;
  LeadTemperature?: "hot" | "warm" | "cold";
};

export async function updateCustomer(
  id: string,
  payload: CustomerActionPayload
) {
  const response = await fetch(API_ROUTES.CUSTOMER.UPDATE(id), {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Customer update failed (${response.status})`
    );
  }

  return result;
}
