"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";


const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Jost:wght@300;400;500&display=swap');
`;

export default function Home() {
  const [currentData, setCurrentData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [serialInput, setSerialInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
const [isPaused, setIsPaused] = useState(false);
const [offset, setOffset] = useState(0);


const manualScroll = (direction: 'left' | 'right') => {
  const el = carouselRef.current;
  if (!el) return;
  const scrollAmount = 350; // Width of card + gap
  el.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: "smooth"
  });
};

const scrollBy = (dir: 1 | -1) => {
  carouselRef.current?.scrollBy({ left: dir * 270, behavior: "smooth" });
};

  const searchSerial = async () => {
    const input = serialInput.trim().toUpperCase();
    setShowModal(false);
    setShowError(false);
    if (!input) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/bars?serial=${encodeURIComponent(input)}`);
      if (!res.ok) { setShowError(true); return; }
      const json = await res.json();
      setCurrentData(json.data);
      setShowModal(true);
    } catch {
      setShowError(true);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) setProducts(data);
        else if (data?.products) setProducts(data.products);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

 

  const closeCard = () => {
    setShowModal(false);
    setSerialInput("");
    setCurrentData(null);
  };

  const downloadCertificate = () => {
    if (!currentData) return;
    const canvas = document.createElement("canvas");
    canvas.width = 800; canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0f0e0c");
    gradient.addColorStop(0.5, "#1a1500");
    gradient.addColorStop(1, "#0f0e0c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(201,168,76,0.06)"; ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width + canvas.height; i += 60) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(0, i); ctx.stroke();
    }
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
    ctx.strokeStyle = "rgba(201,168,76,0.3)"; ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);
    ctx.fillStyle = "rgba(201,168,76,0.08)";
    ctx.beginPath(); ctx.arc(400, 130, 65, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(400, 130, 65, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#e0c47a"; ctx.lineWidth = 7;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(372, 132); ctx.lineTo(393, 153); ctx.lineTo(430, 110); ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.font = "300 52px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("MK Gold Lab", canvas.width / 2, 240);
    ctx.fillStyle = "#c9a84c"; ctx.font = "16px Helvetica, sans-serif";
    ctx.fillText("CERTIFICATE OF AUTHENTICITY", canvas.width / 2, 275);
    ctx.strokeStyle = "rgba(201,168,76,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 300); ctx.lineTo(700, 300); ctx.stroke();
    const details: [string, string][] = [
      ["Serial Number", currentData.serialNo],
      ["Weight", currentData.weight],
      ["Purity", currentData.purity],
      ["Metal", currentData.metal],
      ["Origin", currentData.origin],
      ["Certified By", currentData.certifiedBy],
      ["Production Date", currentData.production],
    ];
    details.forEach(([label, value], i) => {
      const y = 370 + i * 72;
      ctx.fillStyle = "#c9a84c"; ctx.font = "13px Helvetica, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label.toUpperCase(), 100, y);
      ctx.fillStyle = "#ffffff"; ctx.font = "22px Georgia, serif"; ctx.textAlign = "right";
      ctx.fillText(value ?? "—", 700, y + 26);
      ctx.strokeStyle = "rgba(201,168,76,0.15)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(100, y + 40); ctx.lineTo(700, y + 40); ctx.stroke();
    });
    ctx.fillStyle = "rgba(201,168,76,0.5)"; ctx.font = "13px Helvetica, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("This certificate verifies the authenticity of the silver bar issued by Silver Lab", canvas.width / 2, 920);
    ctx.fillStyle = "#7a7060"; ctx.font = "12px Helvetica, sans-serif";
    ctx.fillText("© 2026 Silver Lab. All Rights Reserved.", canvas.width / 2, 960);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `GoldLab-${currentData.serialNo}.png`;
      a.href = url; a.click();
      URL.revokeObjectURL(url);
    });
  };

  const loopedProducts = products.length > 0 ? [...products, ...products] : [];

  return (
    <div className="relative z-10 min-h-screen flex flex-col" style={{ fontFamily: "'Jost', sans-serif", color: "#e8e0d0" }}>
<style>{KEYFRAMES}</style>
      {/* ── HERO ── */}
      <section className="fade-in flex flex-col items-center text-center pt-20 pb-12 px-6">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center mb-6"
          style={{
            border: "1px solid rgba(201,168,76,0.3)",
            background: "rgba(201,168,76,0.1)",
            boxShadow: "0 0 48px rgba(201,168,76,0.15)",
          }}
        >
          {/* <svg width="34" height="34" fill="none" stroke="#c9a84c" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg> */}
          {/* img */}
          <img src="/logo.png" alt="Silver Lab Logo" className="w-full h-full rounded-full" />
        </div>

        <p style={{ color: "#c9a84c", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Official Verification System
        </p>

        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,5.5vw,3.6rem)", fontWeight: 300, lineHeight: 1, color: "#e8e0d0", marginBottom: "1rem" }}>
          MK Gold Lab
        </h1>

        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#7a7060", letterSpacing: "0.04em", maxWidth: "24rem" }}>
          Authenticate your bar with a single serial number
        </p>
      </section>

      {/* ── SEARCH CARD ── */}
      <section className="w-full mx-auto px-5 mb-10" style={{ maxWidth: "580px" }}>
        <div style={{
          background: "rgba(23,22,15,0.88)",
          border: "1px solid rgba(201,168,76,0.28)",
          borderRadius: "2px",
          padding: "2rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.55rem", fontWeight: 400, color: "#e8e0d0", textAlign: "center", marginBottom: "0.3rem" }}>
            Verify Your Bar
          </h2>
          <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "#7a7060", textAlign: "center", marginBottom: "1.5rem", letterSpacing: "0.04em" }}>
            Enter the serial number printed on your bar
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSerial()}
              placeholder="e.g. KHI0B7C6Y"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "2px",
                color: "#e8e0d0",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 300,
                padding: "0.8rem 1rem",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#c9a84c";
                e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(201,168,76,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={searchSerial}
              disabled={isSearching}
              style={{
                background: "#c9a84c",
                color: "#0a0805",
                border: "none",
                borderRadius: "2px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "0.8rem 1.25rem",
                cursor: isSearching ? "default" : "pointer",
                opacity: isSearching ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { if (!isSearching) (e.currentTarget as HTMLButtonElement).style.background = "#e0c47a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#c9a84c"; }}
            >
              {isSearching ? (
                <div className="spinner" />
              ) : (
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              )}
              {!isSearching && "Search"}
            </button>
          </div>

       
        </div>
      </section>

      {/* ── ERROR ── */}
      {showError && (
        <div className="w-full mx-auto px-5 mb-8" style={{ maxWidth: "480px" }}>
          <div style={{
            background: "rgba(192,57,43,0.1)",
            border: "1px solid rgba(192,57,43,0.3)",
            borderRadius: "2px",
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <svg style={{ color: "#e87060", flexShrink: 0 }} width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p style={{ fontSize: "0.83rem", fontWeight: 500, color: "#e87060" }}>Serial Number Not Found</p>
              <p style={{ fontSize: "0.7rem", fontWeight: 300, color: "#7a7060", marginTop: "0.1rem" }}>Please check the number and try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCTS CAROUSEL ── */}
{products.length > 0 && (
  <section className="w-full py-20 relative overflow-hidden group/main">
    {/* Decorative bg text */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[14vw] font-black uppercase pointer-events-none select-none"
      style={{ color: "rgba(255,255,255,0.018)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      Authentic
    </div>

    {/* Section header */}
    <div className="relative z-10 text-center mb-14">

      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 300, color: "#e8e0d0" }}>
        Our Products
      </h2>
      <div style={{ width: "48px", height: "1px", background: "#c9a84c", margin: "1rem auto 0", opacity: 0.4 }} />
    </div>

    {/* Arrow buttons — work by shifting offset */}
    <button
      onClick={() => setOffset(o => o + 300)}
      className="absolute left-6 top-[58%] -translate-y-1/2 z-40 opacity-0 group-hover/main:opacity-100 transition-all duration-300"
      style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.3)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)"; }}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
    </button>
    <button
      onClick={() => setOffset(o => o - 300)}
      className="absolute right-6 top-[58%] -translate-y-1/2 z-40 opacity-0 group-hover/main:opacity-100 transition-all duration-300"
      style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.3)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)"; }}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </button>

    {/* Edge fades */}
    <div className="absolute inset-y-0 left-0 w-32 z-30 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(10,8,5,0.95), transparent)" }} />
    <div className="absolute inset-y-0 right-0 w-32 z-30 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(10,8,5,0.95), transparent)" }} />

    {/* Carousel */}
    <div className="overflow-hidden" style={{ cursor: isPaused ? "grab" : "default" }}>
      <motion.div
        className="flex gap-6 px-4"
        style={{ width: "max-content" }}
        animate={{ x: offset + [-1 * 320 * products.length, 0][0] }}
        transition={{ duration: 0 }}
      >
        {/* Use a self-animating inner track */}
      </motion.div>

      {/* Self-contained infinite loop */}
      <motion.div
        className="flex gap-6 px-4"
        style={{ width: "max-content" }}
        animate={isPaused ? {} : { x: [0 + offset, (-320 * products.length) + offset] }}
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: products.length * 4, ease: "linear" },
        }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
      >
        {[...products, ...products, ...products].map((p, i) => (
          <div
            key={`${p._id}-${i}`}
            className="flex-shrink-0 group/card"
            style={{ width: "280px" }}
          >
            <div
              style={{
                background: "rgba(23,22,15,0.85)",
                border: "1px solid rgba(201,168,76,0.12)",
                borderRadius: "3px",
                overflow: "hidden",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(201,168,76,0.4)";
                el.style.transform = "translateY(-6px)";
                el.style.boxShadow = "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.06)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(201,168,76,0.12)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Image area */}
              <div style={{ height: "200px", background: "rgba(15,14,10,0.6)", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                {/* Gold glow on hover */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 70%)", opacity: 0, transition: "opacity 0.4s" }}
                  className="group-hover/card:opacity-100"
                />
                <img
                  src={p.img} alt={p.title}
                  style={{ maxHeight: "160px", maxWidth: "85%", objectFit: "contain", transition: "transform 0.5s", position: "relative", zIndex: 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
              </div>

              {/* Body */}
              <div style={{ padding: "1.1rem 1.25rem 1.25rem" }}>
                {/* Weight badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem" }}>
                  {p.weight && (
                    <span style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", padding: "0.2rem 0.6rem", borderRadius: "2px" }}>
                      {p.weight}
                    </span>
                  )}
                  <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.08)" }} />
                  <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#e0c47a" }}>{p.price}</span>
                </div>

                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", fontWeight: 400, color: "#e8e0d0", lineHeight: 1.35, marginBottom: "1rem" }}>
                  {p.title}
                </h3>

       
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
)}
      {/* ── FOOTER ── */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid rgba(201,168,76,0.08)", padding: "2rem 1.5rem", textAlign: "center" }}>
        <p className="text-amber-400" style={{ fontSize: "0.68rem", fontWeight: 300, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          © 2026 All Rights · Reserved MK Gold Lab
        </p>
      </footer>

      {/* ── MODAL ── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
          opacity: showModal ? 1 : 0,
          pointerEvents: showModal ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
        onClick={closeCard}
      >
        {/* Backdrop */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }} />

        {/* Card */}
        <div
          className={showModal ? "modal-enter" : ""}
          style={{
            position: "relative", zIndex: 1,
            width: "100%", maxWidth: "400px",
            background: "#17160f",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "2px",
            boxShadow: "0 48px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,76,0.06) inset",
            maxHeight: "92vh",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 1.5rem 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: "2px", padding: "0.25rem 0.65rem", color: "#4ade80", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <svg width="9" height="9" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Verified
            </div>
            <button
              onClick={closeCard}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7a7060", borderRadius: "2px", padding: "0.25rem 0.5rem", fontSize: "0.85rem", lineHeight: 1, cursor: "pointer" }}
            >✕</button>
          </div>

          {/* Hero */}
          <div style={{ padding: "1.25rem 1.5rem 1.25rem", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.9rem" }}>
              <svg width="22" height="22" fill="none" stroke="#4ade80" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.55rem", fontWeight: 300, color: "#e8e0d0", marginBottom: "0.25rem" }}>
              Authenticity Confirmed
            </h3>
            <p style={{ fontSize: "0.73rem", fontWeight: 300, color: "#7a7060", lineHeight: 1.55 }}>
              This silver bar is verified from the Official Silver Lab production.
            </p>
          </div>

          {/* Details */}
          <div style={{ padding: "0 1.5rem" }}>
            {([
              ["Serial No.", currentData?.serialNo],
              ["Weight",    currentData?.weight],
              ["Purity",    currentData?.purity],
              ["Metal",     currentData?.metal],
              ["Origin",    currentData?.origin],
              ["Certified By", currentData?.certifiedBy],
              ["Production",   currentData?.production],
            ] as [string, string | undefined][]).map(([label, value], i, arr) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  gap: "1rem", padding: "0.8rem 0",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(201,168,76,0.07)" : "none",
                }}
              >
                <span style={{ fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9a84c", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "0.95rem", fontWeight: 400, color: "#e8e0d0", textAlign: "right", wordBreak: "break-all" }}>
                  {value ?? "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Download */}
          <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
            <button
              onClick={downloadCertificate}
              style={{
                width: "100%", background: "#c9a84c", color: "#0a0805", border: "none",
                borderRadius: "2px", fontFamily: "'Jost', sans-serif", fontSize: "0.7rem",
                fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "0.9rem 1rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e0c47a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#c9a84c"; }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}