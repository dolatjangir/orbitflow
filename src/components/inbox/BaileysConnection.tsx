"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Smartphone, KeyRound, RefreshCw, LogOut, LoaderCircle, ShieldCheck } from "lucide-react";
import { getSocket } from "@/socket/socket";

import BaileysQRCode from "./BaileysQRCode";
import { API_ROUTES } from "@/constants/ApiRoutes";

type AccountDetails = {
  phone: string;
  name: string;
  imageUrl?: string | null;
};

type QRMeta = {
  generatedAt: number;
  refreshInterval: number;
};

type Status = "loading" | "scanning" | "pairing" | "connected";
type Mode = "qr" | "pairing";

export type BaileysConnectionStatus = "disconnected" | "connecting" | "connected";

export type BaileysConnectionProps = {
  open: boolean;
  onClose: () => void;
  onStatusChange?: (status: BaileysConnectionStatus) => void;
};

const DEFAULT_REFRESH_MS = 20_000;
const PAIRING_CODE_TTL_MS = 60_000;

export default function BaileysConnection({
  open,
  onClose,
  onStatusChange,
}: BaileysConnectionProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<Mode>("qr");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrMeta, setQrMeta] = useState<QRMeta | null>(null);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingGeneratedAt, setPairingGeneratedAt] = useState<number | null>(null);
  const [pairingError, setPairingError] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pairingSecondsLeft, setPairingSecondsLeft] = useState(0);

  const updateStatus = useCallback((next: Status) => {
    setStatus(next);
    onStatusChange?.(
      next === "connected" ? "connected" :
      next === "loading" ? "connecting" :
      next === "scanning" || next === "pairing" ? "connecting" : "disconnected"
    );
  }, [onStatusChange]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPP_CONNECTION_STATUS, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check WhatsApp connection.");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        if (data.status === "connected") {
          setAccount(data.user ?? null);
          setQrCode(null);
          setPairingCode(null);
          updateStatus("connected");
        } else if (data.status === "scanning") {
          setMode("qr");
          setQrCode(data.qrString ?? null);
          setQrMeta({
            generatedAt: data.generatedAt ?? Date.now(),
            refreshInterval: data.refreshInterval ?? DEFAULT_REFRESH_MS,
          });
          updateStatus("scanning");
        } else if (data.status === "pairing") {
          setMode("pairing");
          setPairingCode(data.pairingCode ?? null);
          setPairingGeneratedAt(data.generatedAt ?? Date.now());
          if (data.phoneNumber) setPhoneInput(data.phoneNumber);
          updateStatus("pairing");
        } else {
          updateStatus("loading");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch WhatsApp connection status:", error);
        if (active) updateStatus("loading");
      });

    const socket = getSocket();
    if (socket) {
      socket.emit("whatsapp:start_viewing");

      const handleQR = (data: { qrString: string; generatedAt?: number; refreshInterval?: number }) => {
        setQrCode(data.qrString);
        setQrMeta({
          generatedAt: data.generatedAt ?? Date.now(),
          refreshInterval: data.refreshInterval ?? DEFAULT_REFRESH_MS,
        });
        setIsDisconnecting(false);
        updateStatus("scanning");
      };

      const handlePairingCode = (data: { code: string; generatedAt?: number }) => {
        setPairingCode(data.code);
        setPairingGeneratedAt(data.generatedAt ?? Date.now());
        setPairingError("");
        setIsRequestingCode(false);
        updateStatus("pairing");
      };

      const handlePairingError = (data: { message: string }) => {
        setPairingError(data.message || "Failed to generate pairing code. Try again.");
        setIsRequestingCode(false);
      };

      const handleStatus = (data: { status: string; user?: AccountDetails }) => {
        if (data.status === "connected") {
          setAccount(data.user ?? null);
          setQrCode(null);
          setQrMeta(null);
          setPairingCode(null);
          setPairingGeneratedAt(null);
          setIsDisconnecting(false);
          updateStatus("connected");
        } else if (data.status === "disconnected") {
          setAccount(null);
          setQrCode(null);
          setQrMeta(null);
          setPairingCode(null);
          setPairingGeneratedAt(null);
          setIsDisconnecting(false);
          updateStatus("loading");
        }
      };

      socket.on("whatsapp:qr", handleQR);
      socket.on("whatsapp:status", handleStatus);
      socket.on("whatsapp:pairing_code", handlePairingCode);
      socket.on("whatsapp:pairing_error", handlePairingError);

      return () => {
        active = false;
        socket.off("whatsapp:qr", handleQR);
        socket.off("whatsapp:status", handleStatus);
        socket.off("whatsapp:pairing_code", handlePairingCode);
        socket.off("whatsapp:pairing_error", handlePairingError);
        socket.emit("whatsapp:stop_viewing");
      };
    }

    return () => {
      active = false;
    };
  }, [open, updateStatus]);

  useEffect(() => {
    if (!open || !qrMeta) return;
    const tick = () => {
      const remaining = Math.max(0, qrMeta.refreshInterval - (Date.now() - qrMeta.generatedAt));
      setSecondsLeft(Math.ceil(remaining / 1000));
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [open, qrMeta]);

  useEffect(() => {
    if (!open || !pairingGeneratedAt) return;
    const tick = () => {
      const remaining = Math.max(0, PAIRING_CODE_TTL_MS - (Date.now() - pairingGeneratedAt));
      setPairingSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) setPairingCode(null);
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [open, pairingGeneratedAt]);

  const requestPairingCode = async () => {
    const digitsOnly = phoneInput.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 8) {
      setPairingError("Enter your full number with country code, e.g. 91XXXXXXXXXX.");
      return;
    }
    setPairingError("");
    setPairingCode(null);
    setIsRequestingCode(true);
    try {
      const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPP_CONNECTION_PAIRING_CODE, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: digitsOnly }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setPairingError(data.error || "Something went wrong. Try again.");
        setIsRequestingCode(false);
      }
    } catch (error) {
      console.error("Failed to request pairing code:", error);
      setPairingError("Couldn't reach the server. Try again.");
      setIsRequestingCode(false);
    }
  };

  const disconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPP_CONNECTION_LOGOUT, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Unable to disconnect WhatsApp.");
    } catch (error) {
      console.error("Failed to disconnect WhatsApp:", error);
      setIsDisconnecting(false);
      setPairingError("Unable to disconnect. Please try again.");
    }
  };

  const formattedPairingCode = useMemo(
    () => pairingCode?.match(/.{1,4}/g)?.join("-") ?? pairingCode,
    [pairingCode],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="baileys-connection-title">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 id="baileys-connection-title" className="text-base font-bold text-[var(--text)]">WhatsApp connection</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {status === "connected" ? "Your WhatsApp account is connected" : "Connect your WhatsApp account"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {status === "connected" ? (
            <div className="flex flex-col items-center py-4 text-center">
              {account?.imageUrl ? <img src={account.imageUrl} alt="" className="mb-3 size-16 rounded-full object-cover" /> : <div className="mb-3 grid size-16 place-items-center rounded-full bg-green-100 text-green-700"><Smartphone size={26} /></div>}
              <p className="font-semibold text-[var(--text)]">{account?.name || "WhatsApp connected"}</p>
              {account?.phone && <p className="mt-1 text-sm text-[var(--muted)]">{account.phone}</p>}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"><ShieldCheck size={14} /> Connected</div>
              <div className="mt-6 flex w-full gap-2">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white">Continue to Inbox</button>
                <button type="button" onClick={disconnect} disabled={isDisconnecting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-50"><LogOut size={15} /> {isDisconnecting ? "Disconnecting…" : "Disconnect"}</button>
              </div>
            </div>
          ) : (
            <>
              {status === "loading" && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">
                  <LoaderCircle className="animate-spin" size={17} /> Checking connection / waiting for QR…
                </div>
              )}
              <div className="mb-5 grid grid-cols-2 rounded-xl bg-[var(--surface-2)] p-1">
                <button type="button" onClick={() => { setMode("qr"); setPairingError(""); }} className={`rounded-lg py-2 text-sm font-semibold ${mode === "qr" ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm" : "text-[var(--muted)]"}`}><Smartphone size={14} className="mr-1 inline" /> Scan QR</button>
                <button type="button" onClick={() => { setMode("pairing"); setPairingError(""); }} className={`rounded-lg py-2 text-sm font-semibold ${mode === "pairing" ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm" : "text-[var(--muted)]"}`}><KeyRound size={14} className="mr-1 inline" /> Pairing code</button>
              </div>

              {mode === "qr" ? (
                <div className="flex flex-col items-center">
                  <BaileysQRCode qr={qrCode} />
                  <p className="mt-3 text-xs text-[var(--muted)]">Open WhatsApp → Linked devices → Link a device.</p>
                  {qrMeta && <p className="mt-1 text-xs text-[var(--muted)]">QR refresh in {secondsLeft}s</p>}
                  <button type="button" onClick={() => { setQrCode(null); updateStatus("loading"); }} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)]"><RefreshCw size={13} /> Waiting for a fresh QR</button>
                </div>
              ) : (
                <div>
                  {!pairingCode ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--muted)]">Enter your WhatsApp number with country code.</p>
                      <input value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} type="tel" inputMode="numeric" placeholder="e.g. 919876543210" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
                      <button type="button" onClick={requestPairingCode} disabled={isRequestingCode} className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{isRequestingCode ? "Generating code…" : "Generate pairing code"}</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-[var(--muted)]">Enter this code on your phone</p>
                      <p className="my-4 rounded-xl border border-dashed border-[var(--primary)] bg-[var(--surface-2)] px-4 py-5 font-mono text-2xl font-bold tracking-[0.2em] text-[var(--primary)]">{formattedPairingCode}</p>
                      <p className="text-xs text-[var(--muted)]">{pairingSecondsLeft > 0 ? `Expires in ${pairingSecondsLeft}s` : "Code expired"}</p>
                      {pairingSecondsLeft <= 0 && <button type="button" onClick={requestPairingCode} disabled={isRequestingCode} className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white">Resend code</button>}
                      <ol className="mt-5 space-y-2 text-left text-xs text-[var(--muted)]">
                        <li>1. Open WhatsApp on your phone.</li>
                        <li>2. Open Linked Devices in Settings.</li>
                        <li>3. Choose Link with phone number instead and enter the code.</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
              {pairingError && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{pairingError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
