import { API_ROUTES } from "@/constants/ApiRoutes";
import { mailAllContactInterface, mailAllCustomerInterface, mailAllDataInterface } from "./mail.interface";

export const getMail = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    
   
   // console.log("mail data ",data)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getMailById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.GET_BY_ID(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
     
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getFilteredMail = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.GET_BY_PARAMS(params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const addMail = async (data: mailAllDataInterface) => {
  try {
    const payload={...data,type:'email'}
    const response = await fetch(API_ROUTES.MASTERS.MAIL.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const updateMail = async (id: string, data: mailAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const deleteMail = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const emailAllCustomer = async (data: mailAllCustomerInterface) => {
  try {

    console.log("emailall customer data ", data)
    const response = await fetch(API_ROUTES.MASTERS.MAIL.MAILALL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const emailAllContact = async (data: mailAllContactInterface) => {
  try {

    console.log("emailall customer data ", data)
    const response = await fetch(API_ROUTES.MASTERS.MAIL.MAILALL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const emailCustomerViaAi = async (data: any) => {
  try {

    console.log("emailall customer data ", data)
    const response = await fetch(API_ROUTES.MASTERS.MAIL.SEND_EMAIL_VIA_AI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(" result is zoro",result)
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};






// connection api call for email


// ─────────────────────────────────────────────────────────────
// APPEND to the bottom of your existing mail api file
// (the one that already imports API_ROUTES). Types can also be
// moved into mail.interface.ts if you prefer.
//
// NOTE: unlike the older functions (which return null on any error),
// these return { ok, ... } so the UI can read the backend's 422 body
// (code / message / hint / needsAdvanced / tried[]).
// ─────────────────────────────────────────────────────────────

/* ---------- Types ---------- */
export type EmailErrorCode =
  | "AUTH_FAILED"
  | "APP_PASSWORD_REQUIRED"
  | "BASIC_AUTH_DISABLED"
  | "OAUTH_REQUIRED"
  | "UNSUPPORTED_PROVIDER"
  | "INVALID_DOMAIN"
  | "TLS_CERT_MISMATCH"
  | "UNREACHABLE";

export interface EmailConnection {
  connected: boolean;
  email?: string;
  fromName?: string;
  provider?: string;
  providerLabel?: string;
  smtp?: { host: string; port: number; secure: boolean };
  saveToSent?: boolean;
  sentFolder?: string | null;
  status?: "connected" | "failed" | string;
  lastVerifiedAt?: string | null;
  lastError?: string | null;
  updatedAt?: string;
}

export interface EmailAttempt {
  host: string;
  port: number;
  secure?: boolean;
  result: string; // ok | auth_failed | app_password_required | basic_auth_disabled | tls_cert | unreachable | blocked_private_address | dns_not_found
}

export interface EmailConnectionError {
  success: false;
  code?: EmailErrorCode;
  message: string;
  hint?: string;
  needsAdvanced?: boolean;
  provider?: string;
  providerLabel?: string;
  tried?: EmailAttempt[];
  connection?: EmailConnection; // present on a failed /verify
}

export interface EmailDetected {
  ok: boolean;
  provider: string;
  providerLabel: string;
  source: "registry" | "mx" | "autoconfig" | "guess" | "manual";
  smtp: { host: string; port: number; secure: boolean; user: string };
  imap: { host: string; port: number; secure: boolean; user: string } | null;
  saveToSent: boolean;
  sentFolder: string | null;
  warnings: string[];
}

export interface EmailConnectPayload {
  email: string;
  password: string;
  fromName?: string;
  advanced?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser?: string;
    imapHost?: string;
    imapPort?: number;
  };
}

export type EmailConnectionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: EmailConnectionError };

/* ---------- Shared request helper ---------- */
async function emailConnectionRequest<T>(
  url: string,
  method: "GET" | "POST" | "DELETE",
  body?: unknown
): Promise<EmailConnectionResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    let json: any = null;
    try {
      json = await response.json();
    } catch {
      /* empty / non-JSON body */
    }

    if (response.ok && json?.success !== false) {
      return { ok: true, data: json as T };
    }

    return {
      ok: false,
      status: response.status,
      error: {
        success: false,
        code: json?.code,
        message:
          json?.message ||
          json?.connection?.lastError ||
          (response.status === 429
            ? "A connection check is already running. Please wait a moment."
            : `Request failed (HTTP ${response.status})`),
        hint: json?.hint,
        needsAdvanced: json?.needsAdvanced,
        provider: json?.provider,
        providerLabel: json?.providerLabel,
        tried: json?.tried,
        connection: json?.connection,
      },
    };
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return {
      ok: false,
      status: 0,
      error: { success: false, message: "Could not reach the server. Check your connection and try again." },
    };
  }
}

/* ---------- API calls ---------- */

/** Current saved mailbox (never includes the password). */
export const getEmailConnection = () =>
  emailConnectionRequest<{ success: true; connection: EmailConnection }>(
    API_ROUTES.MASTERS.MAIL.EMAIL_CONNECTION,
    "GET"
  );

/** Detect + verify only. Saves nothing. */
export const testEmailConnection = (payload: EmailConnectPayload) =>
  emailConnectionRequest<{ success: true; detected: EmailDetected }>(
    API_ROUTES.MASTERS.MAIL.EMAIL_CONNECTION_TEST,
    "POST",
    payload
  );

/** Detect + verify + save (replaces any existing connection). */
export const connectEmail = (payload: EmailConnectPayload) =>
  emailConnectionRequest<{
    success: true;
    message: string;
    warnings: string[];
    connection: EmailConnection;
  }>(API_ROUTES.MASTERS.MAIL.EMAIL_CONNECTION, "POST", payload);

/** Re-check the saved mailbox (e.g. after a password change at the provider). */
export const verifyEmailConnection = () =>
  emailConnectionRequest<{ success: true; connection: EmailConnection }>(
    API_ROUTES.MASTERS.MAIL.EMAIL_CONNECTION_VERIFY,
    "POST"
  );

/** Disconnect — sending falls back to the default platform mailbox. */
export const disconnectEmail = () =>
  emailConnectionRequest<{ success: true; message: string; connection: EmailConnection }>(
    API_ROUTES.MASTERS.MAIL.EMAIL_CONNECTION,
    "DELETE"
  );