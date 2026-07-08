// ============================================================
// components/HistoryPanel.jsx
// Authed users  → data from Supabase (persistent, cross-device)
// Guest users   → in-memory only (shown with a sign-up nudge)
// ============================================================
import { useState, useEffect } from "react";
import { MODES } from "../config/constants";
import { useAuth } from "../context/AuthContext";

export default function HistoryPanel({ localHistory, loadHistory, onLoad, onDelete, onClose }) {
  const { state } = useAuth();
  const [items,    setItems]   = useState([]);
  const [fetching, setFetching]= useState(false);

  useEffect(() => {
  if (state === "authed") {
    setFetching(true);
    loadHistory()
      .then(data => setItems(data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }
}, [state]);

useEffect(() => {
  if (state !== "authed") {
    setItems(localHistory);
  }
}, [localHistory, state]);

  const handleDelete = async (id) => {
  setItems(prev => prev.filter(i => i.id !== id));
  await onDelete(id);
  };

  const displayItems = state === "authed" ? items : localHistory;

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3 className="history-title">&#128203; Content History</h3>
        <div className="history-header-actions">
          {displayItems.length > 0 && (
            <span className="history-count">{displayItems.length} saved</span>
          )}
          <button className="history-close" onClick={onClose}>&#215;</button>
        </div>
      </div>

      {/* Guest nudge */}
      {state === "guest" && (
        <div className="history-guest-note">
          🔒 Sign up to save history permanently across devices
        </div>
      )}

      {fetching ? (
        <div className="history-loading">Loading...</div>
      ) : displayItems.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">&#128196;</span>
          <p>No saved content yet.</p>
          <p className="history-empty-sub">
            After generating, click "Save" on the result to keep it here.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {displayItems.map((item) => {
            const modeObj = MODES.find(m => m.id === item.mode);
            const date = item.created_at
              ? new Date(item.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })
              : item.date || "";
            return (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <div className="history-item-mode" style={{"--mode-color": modeObj?.color}}>
                    {modeObj?.icon} {modeObj?.label}
                  </div>
                  <span className="history-item-date">{date}</span>
                </div>
                <p className="history-item-topic">{item.topic}</p>
                <p className="history-item-preview">{item.content?.slice(0, 100)}...</p>
                <div className="history-item-actions">
                  <button className="history-load-btn" onClick={() => onLoad(item)}>Load</button>
                  <button className="history-delete-btn" onClick={() => handleDelete(item.id)}>&#128465;</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
