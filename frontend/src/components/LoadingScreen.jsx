import { useState, useEffect } from "react";
import { LOADING_QUOTES } from "../config/constants";

export default function LoadingScreen({ mode }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % LOADING_QUOTES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const q = LOADING_QUOTES[quoteIdx];

  return (
    <div className="loading-screen fade-in">
      <div className="loading-orb">
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
        <span className="orb-icon">&#9998;</span>
      </div>

      <div className="loading-status">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      <p className="loading-mode-label">Crafting your {mode} content</p>

      <div className={`quote-box ${visible ? "quote-visible" : "quote-hidden"}`}>
        <p className="quote-text">&#8220;{q.quote}&#8221;</p>
        <p className="quote-author">— {q.author}</p>
      </div>
    </div>
  );
}