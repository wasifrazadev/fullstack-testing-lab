import { useEffect, useState } from "react";
import { getApiBaseUrl, setApiBaseUrl } from "../services/api";
import { checkBackendHealth } from "../services/healthService";

export default function BackendConnection({ onConnectionChange }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(getApiBaseUrl());
  const [backend, setBackend] = useState(null);
  const [status, setStatus] = useState("checking");
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function closeModal() {
    setOpen(false);
    setMessage("");
    setMessageType("");
  }

  function validateUrl(value) {
    const cleanUrl = value.trim().replace(/\/+$/, "");

    try {
      const parsedUrl = new URL(cleanUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return null;
      }

      return cleanUrl;
    } catch {
      return null;
    }
  }

  async function requestHealth(targetUrl) {
    const cleanUrl = validateUrl(targetUrl);

    if (!cleanUrl) {
      throw new Error("Please enter a valid HTTP or HTTPS URL.");
    }

    const data = await checkBackendHealth(cleanUrl);

    if (
      data.status !== "ok" ||
      !data.backend ||
      !data.port
    ) {
      throw new Error("Invalid health response.");
    }

    return { data, cleanUrl };
  }

  async function testConnection() {
    setTesting(true);
    setMessage("");
    setMessageType("");

    try {
      const { data } = await requestHealth(url);

      setMessage("Connection test successful!");
      setMessageType("success");

      return data;
    } catch (error) {
      setMessage(
        error.message === "Please enter a valid HTTP or HTTPS URL."
          ? error.message
          : "Unable to connect. Check the URL and backend."
      );
      setMessageType("error");

      return null;
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    const data = await testConnection();

    if (!data) return;

    const cleanUrl = validateUrl(url);

    // Update the shared Axios API instance.
    setApiBaseUrl(cleanUrl);

    setUrl(cleanUrl);
    setBackend(data);
    setStatus("connected");

    onConnectionChange?.(data);

    setMessage("Backend connected successfully!");
    setMessageType("success");
  }

  async function handleCheckCurrent() {
    setStatus("checking");
    setBackend(null);

    try {
      const { data } = await requestHealth(getApiBaseUrl());

      setBackend(data);
      setStatus("connected");
      onConnectionChange?.(data);
    } catch {
      setBackend(null);
      setStatus("disconnected");
      onConnectionChange?.(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function checkCurrentBackend() {
      try {
        const { data } = await requestHealth(getApiBaseUrl());

        if (!active) return;

        setBackend(data);
        setStatus("connected");
        onConnectionChange?.(data);
      } catch {
        if (!active) return;

        setBackend(null);
        setStatus("disconnected");
        onConnectionChange?.(null);
      }
    }

    checkCurrentBackend();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !testing) {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, testing]);

  return (
    <div className="backend-connection">
      <button
        type="button"
        className={`environment-badge backend-trigger ${status}`}
        onClick={() => {
          setUrl(getApiBaseUrl());
          setMessage("");
          setMessageType("");
          setOpen(true);
        }}
      >
        <span className={`backend-trigger-dot ${status}`} />

        <span className="backend-trigger-text">
          {status === "checking"
            ? "Checking backend..."
            : status === "connected"
              ? `${backend.backend} · ${backend.port}`
              : "Not Connected"}
        </span>

        {/* <span className="backend-trigger-arrow"></span> */}
      </button>

      {open && (
        <div
          className="backend-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !testing
            ) {
              closeModal();
            }
          }}
        >
          <section
            className="backend-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="backend-modal-title"
          >
            <div className="backend-modal-header">
              <div>
                <span className="section-kicker">
                  CONNECTION SETTINGS
                </span>

                <h2 id="backend-modal-title">
                  Backend connection
                </h2>

                <p className="backend-modal-description">
                  Choose which API should power your workspace.
                </p>
              </div>

              <button
                type="button"
                className="backend-close-button"
                onClick={closeModal}
                aria-label="Close"
                disabled={testing}
              >
                ×
              </button>
            </div>

            <div className="backend-info">
              <div className="backend-info-heading">
                <span>ACTIVE CONNECTION</span>

                <span className={`backend-status-label ${status}`}>
                  <span className="backend-status-dot" />
                  {status === "connected"
                    ? "Connected"
                    : status === "checking"
                      ? "Checking"
                      : "Disconnected"}
                </span>
              </div>

              <div className="backend-info-divider" />

              <div className="backend-info-row">
                <span>Backend</span>
                <strong>{backend?.backend || "Unknown"}</strong>
              </div>

              <div className="backend-info-row">
                <span>Port</span>
                <strong>{backend?.port || "—"}</strong>
              </div>
            </div>

            <div className="backend-url-section">
              <label
                className="backend-field-label"
                htmlFor="backend-url"
              >
                API Base URL
              </label>

              <input
                id="backend-url"
                className="backend-url-input"
                type="url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setMessage("");
                  setMessageType("");
                }}
                placeholder="http://localhost:3000/api"
                autoComplete="url"
                spellCheck={false}
              />

              <p className="backend-input-hint">
                Enter the base URL of your backend API.
              </p>
            </div>

            {message && (
              <div
                className={`backend-feedback ${messageType}`}
                role="status"
                aria-live="polite"
              >
                <span className="backend-feedback-icon">
                  {messageType === "success" ? "✓" : "!"}
                </span>

                <span>{message}</span>
              </div>
            )}

            <div className="backend-modal-actions">
              <button
                type="button"
                className="button button-secondary"
                disabled={testing}
                onClick={testConnection}
              >
                {testing ? (
                  <>
                    <span className="backend-button-spinner" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </button>

              <button
                type="button"
                className="button button-primary"
                disabled={testing || !url.trim()}
                onClick={handleSave}
              >
                {testing ? <><span className="backend-button-spinner" /> "Connecting..."</> : "Save & Connect"}
                <span>→</span>
              </button>
            </div>252
          </section>
        </div>
      )}
    </div>
  );
}