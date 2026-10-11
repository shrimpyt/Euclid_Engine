"use client";
// MiddleSchoolDiagrams.tsx
// Web (HTML/SVG) diagram renderers for the middle-school area: number lines,
// coordinate grids, spinners, geometric figures, and scatter plots.
// Every kind here has a matching PDF renderer in PdfMiddleSchoolDiagrams.tsx.

import React from "react";
import type {
  MiddleSchoolSVGParams,
  MSNumberLineParams,
  MSCoordinateGridParams,
  MSSpinnerParams,
  MSGeometryFigureParams,
  MSScatterPlotParams,
} from "@/lib/factories/MiddleSchoolTypes";

const INK = "#0F172A";
const ACCENT = "#2563eb";
const RED = "#e11d48";

// ── Number line ───────────────────────────────────────────────────────────────

function MSNumberLineSVG(p: MSNumberLineParams) {
  const W = 200;
  const H = 64;
  const pad = 14;
  const span = p.max - p.min || 1;
  const x = (v: number) => pad + ((v - p.min) / span) * (W - 2 * pad);
  const yMid = 30;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="200" height="64" role="img" aria-label="number line">
      <line x1={pad - 6} y1={yMid} x2={W - pad + 6} y2={yMid} stroke={INK} strokeWidth={1.5} />
      <polygon points={`${pad - 6},${yMid - 4} ${pad - 6},${yMid + 4} ${pad - 12},${yMid}`} fill={INK} />
      <polygon points={`${W - pad + 6},${yMid - 4} ${W - pad + 6},${yMid + 4} ${W - pad + 12},${yMid}`} fill={INK} />
      {p.marks.map((v) => (
        <g key={v}>
          <line x1={x(v)} y1={yMid - 5} x2={x(v)} y2={yMid + 5} stroke={INK} strokeWidth={1} />
          <text x={x(v)} y={yMid + 18} textAnchor="middle" fontSize={9} fill={INK} fontFamily="serif">
            {v}
          </text>
        </g>
      ))}
      {p.highlight.map((v) => (
        <circle key={`h${v}`} cx={x(v)} cy={yMid} r={4} fill={RED} />
      ))}
      {(p.openHighlight ?? []).map((v) => (
        <circle key={`o${v}`} cx={x(v)} cy={yMid} r={4} fill="#fff" stroke={RED} strokeWidth={2} />
      ))}
      {p.ray && (
        <g>
          <line
            x1={x(p.ray.from)}
            y1={yMid}
            x2={p.ray.dir === "right" ? W - pad + 2 : pad - 2}
            y2={yMid}
            stroke={ACCENT}
            strokeWidth={3}
          />
          <circle
            cx={x(p.ray.from)}
            cy={yMid}
            r={4.5}
            fill={p.ray.open ? "#fff" : ACCENT}
            stroke={ACCENT}
            strokeWidth={2}
          />
        </g>
      )}
    </svg>
  );
}

// ── Coordinate grid ───────────────────────────────────────────────────────────

function MSCoordinateGridSVG(p: MSCoordinateGridParams) {
  const W = 200;
  const H = 200;
  const pad = 16;
  const spanX = p.maxX - p.minX || 1;
  const spanY = p.maxY - p.minY || 1;
  const X = (v: number) => pad + ((v - p.minX) / spanX) * (W - 2 * pad);
  const Y = (v: number) => H - pad - ((v - p.minY) / spanY) * (H - 2 * pad);
  const vLines = [];
  for (let gx = Math.ceil(p.minX); gx <= p.maxX; gx++) {
    vLines.push(
      <line key={`v${gx}`} x1={X(gx)} y1={pad} x2={X(gx)} y2={H - pad}
        stroke={gx === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={gx === 0 ? 1.2 : 0.6} />
    );
  }
  const hLines = [];
  for (let gy = Math.ceil(p.minY); gy <= p.maxY; gy++) {
    hLines.push(
      <line key={`h${gy}`} x1={pad} y1={Y(gy)} x2={W - pad} y2={Y(gy)}
        stroke={gy === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={gy === 0 ? 1.2 : 0.6} />
    );
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="200" height="200" role="img" aria-label="coordinate grid">
      {vLines}
      {hLines}
      {(p.polygons ?? []).map((poly, i) => (
        <g key={`poly${i}`}>
          <polygon
            points={poly.points.map((pt) => `${X(pt.x)},${Y(pt.y)}`).join(" ")}
            fill="rgba(37,99,235,0.12)"
            stroke={poly.dashed ? RED : ACCENT}
            strokeWidth={1.5}
            strokeDasharray={poly.dashed ? "5,3" : undefined}
          />
          {poly.label && (
            <text x={X(poly.points[0].x)} y={Y(poly.points[0].y) - 6} fontSize={10}
              fill={INK} fontFamily="serif" fontWeight="bold">
              {poly.label}
            </text>
          )}
        </g>
      ))}
      {(p.segments ?? []).map((s, i) => (
        <line key={`seg${i}`} x1={X(s.x1)} y1={Y(s.y1)} x2={X(s.x2)} y2={Y(s.y2)}
          stroke="#b45309" strokeWidth={1.6} strokeDasharray={s.dashed ? "5,3" : undefined} />
      ))}
      {(p.points ?? []).map((pt, i) => (
        <g key={`pt${i}`}>
          <circle cx={X(pt.x)} cy={Y(pt.y)} r={4}
            fill={pt.filled === false ? "#fff" : INK} stroke={INK} strokeWidth={1.5} />
          {pt.label && (
            <text x={X(pt.x) + 6} y={Y(pt.y) - 5} fontSize={10} fill={INK} fontFamily="serif" fontWeight="bold">
              {pt.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

const SPINNER_DEFAULT_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#f97316", "#14b8a6", "#f43f5e"];

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function MSSpinnerSVG(p: MSSpinnerParams) {
  const C = 100;
  const R = 78;
  const n = p.sectors.length;
  const colors = p.colors && p.colors.length >= n ? p.colors : SPINNER_DEFAULT_COLORS;
  const step = 360 / n;
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="spinner">
      {p.sectors.map((label, i) => {
        const a0 = i * step;
        const a1 = (i + 1) * step;
        const s = polar(C, C, R, a0);
        const e = polar(C, C, R, a1);
        const large = step > 180 ? 1 : 0;
        const mid = polar(C, C, R * 0.62, (a0 + a1) / 2);
        return (
          <g key={i}>
            <path
              d={`M ${C} ${C} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`}
              fill={colors[i % colors.length]}
              fillOpacity={0.75}
              stroke={INK}
              strokeWidth={1.2}
            />
            <text x={mid.x} y={mid.y + 4} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#fff"
              fontFamily="serif" stroke={INK} strokeWidth={0.4}>
              {label}
            </text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r={7} fill={INK} />
      <circle cx={C} cy={C} r={2.5} fill="#fff" />
    </svg>
  );
}

// ── Geometric figures ─────────────────────────────────────────────────────────

function MSGeometryFigureSVG(p: MSGeometryFigureParams) {
  const W = 200;
  const H = 170;
  const d = p.dims;
  const label = (x: number, y: number, text: string, anchor: "middle" | "start" = "middle") => (
    <text x={x} y={y} textAnchor={anchor} fontSize={11} fill={INK} fontFamily="serif" fontWeight="bold">
      {text}
    </text>
  );

  switch (p.figure) {
    case "parallelogram": {
      const base = d.base ?? 8;
      const height = d.height ?? 5;
      const skew = 28;
      const x0 = 40, y1 = 120;
      const x1 = x0 + 120, y0 = y1 - 80;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="parallelogram">
          <polygon points={`${x0 + skew},${y0} ${x1 + skew},${y0} ${x1},${y1} ${x0},${y1}`}
            fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <line x1={x0 + skew} y1={y0} x2={x0 + skew} y2={y1} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label((x0 + x1) / 2 + skew / 2, y1 + 16, `${base}`)}
          {label(x0 + skew - 10, (y0 + y1) / 2, `${height}`, "start")}
          {label(14, 22, `base = ${base}, height = ${height}`, "start")}
        </svg>
      );
    }
    case "triangle": {
      const base = d.base ?? 8;
      const height = d.height ?? 5;
      const x0 = 40, x1 = 160, yb = 130, yt = 50;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="triangle">
          <polygon points={`${x0},${yb} ${x1},${yb} ${x0 + 45},${yt}`}
            fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <line x1={x0 + 45} y1={yt} x2={x0 + 45} y2={yb} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label((x0 + x1) / 2, yb + 16, `${base}`)}
          {label(x0 + 45 + 10, (yt + yb) / 2, `${height}`, "start")}
        </svg>
      );
    }
    case "trapezoid": {
      const b1 = d.base1 ?? 10;
      const b2 = d.base2 ?? 6;
      const h = d.height ?? 4;
      const cx = 100, yb = 130, yt = 55;
      const w1 = 65, w2 = 38;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="trapezoid">
          <polygon points={`${cx - w2},${yt} ${cx + w2},${yt} ${cx + w1},${yb} ${cx - w1},${yb}`}
            fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <line x1={cx + w2 + 6} y1={yt} x2={cx + w2 + 6} y2={yb} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label(cx, yb + 16, `${b1}`)}
          {label(cx, yt - 8, `${b2}`)}
          {label(cx + w2 + 16, (yt + yb) / 2, `${h}`, "start")}
        </svg>
      );
    }
    case "rectangle": {
      const l = d.length ?? d.base ?? 8;
      const w = d.width ?? d.height ?? 5;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="rectangle">
          <rect x={45} y={45} width={110} height={80} fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          {label(100, 142, `${l}`)}
          {label(165, 90, `${w}`, "start")}
        </svg>
      );
    }
    case "rectangular-prism": {
      const l = d.length ?? 5;
      const w = d.width ?? 4;
      const h = d.height ?? 3;
      // simple oblique sketch
      const x0 = 55, y0 = 120, fw = 80, fh = 55, dep = 26;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="rectangular prism">
          <polygon points={`${x0},${y0} ${x0 + fw},${y0} ${x0 + fw},${y0 - fh} ${x0},${y0 - fh}`}
            fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <polygon points={`${x0 + fw},${y0} ${x0 + fw + dep},${y0 - dep} ${x0 + fw + dep},${y0 - dep - fh} ${x0 + fw},${y0 - fh}`}
            fill="rgba(37,99,235,0.05)" stroke={INK} strokeWidth={1.2} />
          <polygon points={`${x0},${y0 - fh} ${x0 + fw},${y0 - fh} ${x0 + fw + dep},${y0 - dep - fh} ${x0 + dep},${y0 - dep - fh}`}
            fill="rgba(37,99,235,0.05)" stroke={INK} strokeWidth={1.2} />
          {label(x0 + fw / 2, y0 + 16, `${l}`)}
          {label(x0 + fw + dep + 4, y0 - dep / 2, `${w}`, "start")}
          {label(x0 - 12, y0 - fh / 2, `${h}`, "start")}
        </svg>
      );
    }
    case "cylinder": {
      const r = d.radius ?? 3;
      const h = d.height ?? 6;
      const cx = 100, ry = 14, yTop = 45, yBot = 125;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="cylinder">
          <path d={`M ${cx - 55} ${yTop} L ${cx - 55} ${yBot} A 55 ${ry} 0 0 0 ${cx + 55} ${yBot} L ${cx + 55} ${yTop}`}
            fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <ellipse cx={cx} cy={yTop} rx={55} ry={ry} fill="rgba(37,99,235,0.16)" stroke={INK} strokeWidth={1.6} />
          <path d={`M ${cx - 55} ${yBot} A 55 ${ry} 0 0 0 ${cx + 55} ${yBot}`}
            fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="4,2" />
          {label(cx + 62, (yTop + yBot) / 2, `${h}`, "start")}
          {label(cx, yTop - 20, `r = ${r}`)}
        </svg>
      );
    }
    case "cone": {
      const r = d.radius ?? 3;
      const h = d.height ?? 6;
      const cx = 100, apexY = 35, baseY = 125, ry = 12;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="cone">
          <polygon points={`${cx},${apexY} ${cx - 55},${baseY} ${cx + 55},${baseY}`}
            fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <ellipse cx={cx} cy={baseY} rx={55} ry={ry} fill="rgba(37,99,235,0.16)" stroke={INK} strokeWidth={1.4} />
          <line x1={cx} y1={apexY} x2={cx} y2={baseY} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label(cx + 8, (apexY + baseY) / 2, `${h}`, "start")}
          {label(cx, baseY + 26, `r = ${r}`)}
        </svg>
      );
    }
    case "sphere": {
      const r = d.radius ?? 4;
      const cx = 100, cy = 85, R = 55;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="sphere">
          <circle cx={cx} cy={cy} r={R} fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.32} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="4,2" />
          <line x1={cx} y1={cy} x2={cx + R * 0.7} y2={cy - R * 0.7} stroke={INK} strokeWidth={1.2} />
          {label(cx + R * 0.35, cy - R * 0.35 - 6, `r = ${r}`)}
        </svg>
      );
    }
    case "circle": {
      const cx = 100, cy = 85, R = 58;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="circle">
          <circle cx={cx} cy={cy} r={R} fill="rgba(37,99,235,0.08)" stroke={INK} strokeWidth={1.6} />
          <circle cx={cx} cy={cy} r={2.5} fill={INK} />
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={INK} strokeWidth={1.2} />
          {d.radius !== undefined && label(cx + R / 2, cy - 8, `r = ${d.radius}`)}
          {d.diameter !== undefined && label(cx, cy + 8, `d = ${d.diameter}`)}
        </svg>
      );
    }
    case "angle-single": {
      const ang = d.angle ?? 60;
      const vx = 60, vy = 120, len = 90;
      const aRad = ((360 - ang) * Math.PI) / 180;
      const ex = vx + len * Math.cos(aRad);
      const ey = vy + len * Math.sin(aRad);
      const ax = vx + 26 * Math.cos(aRad);
      const ay = vy + 26 * Math.sin(aRad);
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="angle">
          <line x1={vx} y1={vy} x2={vx + len} y2={vy} stroke={INK} strokeWidth={1.6} />
          <line x1={vx} y1={vy} x2={ex} y2={ey} stroke={INK} strokeWidth={1.6} />
          <path d={`M ${vx + 26} ${vy} A 26 26 0 0 0 ${ax} ${ay}`}
            fill="none" stroke={ACCENT} strokeWidth={1.6} />
          {label(vx + 46, vy - 14, `${ang}°`)}
        </svg>
      );
    }
    case "angle-complementary": {
      const known = d.angle ?? 35;
      const vx = 55, vy = 125;
      const kRad = ((360 - known) * Math.PI) / 180;
      const kx = vx + 95 * Math.cos(kRad);
      const ky = vy + 95 * Math.sin(kRad);
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="complementary angles">
          <line x1={vx} y1={vy} x2={vx + 100} y2={vy} stroke={INK} strokeWidth={1.6} />
          <line x1={vx} y1={vy} x2={vx} y2={vy - 100} stroke={INK} strokeWidth={1.6} />
          <line x1={vx} y1={vy} x2={kx} y2={ky} stroke={ACCENT} strokeWidth={1.6} />
          <path d={`M ${vx + 12} ${vy} L ${vx + 12} ${vy - 12} L ${vx} ${vy - 12}`} fill="none" stroke={INK} strokeWidth={1.2} />
          {label(vx + 36, vy - 10, `${known}°`)}
          {label(vx + 12, vy - 54, "?")}
        </svg>
      );
    }
    case "angle-supplementary": {
      const known = d.angle ?? 120;
      const vx = 100, vy = 120;
      const kRad = ((180 - known) * Math.PI) / 180;
      const kx = vx + 90 * Math.cos(kRad);
      const ky = vy - 90 * Math.sin(kRad);
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="supplementary angles">
          <line x1={vx - 95} y1={vy} x2={vx + 95} y2={vy} stroke={INK} strokeWidth={1.6} />
          <line x1={vx} y1={vy} x2={kx} y2={ky} stroke={ACCENT} strokeWidth={1.6} />
          {label(vx - 44, vy - 14, `${known}°`)}
          {label(vx + 42, vy - 14, "?")}
        </svg>
      );
    }
    case "angle-vertical": {
      const known = d.angle ?? 60;
      const cx = 100, cy = 90, len = 70;
      const rad = ((known / 2) * Math.PI) / 180;
      const dx = len * Math.cos(rad);
      const dy = len * Math.sin(rad);
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="vertical angles">
          <line x1={cx - dx} y1={cy + dy} x2={cx + dx} y2={cy - dy} stroke={INK} strokeWidth={1.6} />
          <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke={INK} strokeWidth={1.6} />
          {label(cx + dx * 0.45, cy - dy * 0.45 - 8, `${known}°`)}
          {label(cx - dx * 0.45, cy + dy * 0.45 + 16, "?")}
        </svg>
      );
    }
    case "composite": {
      const w1 = d.w1 ?? 10, h1 = d.h1 ?? 5, w2 = d.w2 ?? 5, h2 = d.h2 ?? 4;
      const s = Math.min(120 / w1, 60 / h1, 100 / w2, 50 / h2);
      const bw = w1 * s, bh = h1 * s, tw = w2 * s, th = h2 * s;
      const x0 = (200 - bw) / 2, yb = 135;
      const tx0 = x0 + (bw - tw) / 2;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="composite figure">
          <rect x={x0} y={yb - bh} width={bw} height={bh} fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          <rect x={tx0} y={yb - bh - th} width={tw} height={th} fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.6} />
          {label(x0 + bw / 2, yb + 15, `${w1}`)}
          {label(x0 - 10, yb - bh / 2, `${h1}`, "start")}
          {label(tx0 + tw / 2, yb - bh - th - 7, `${w2}`)}
          {label(tx0 + tw + 6, yb - bh - th / 2, `${h2}`, "start")}
        </svg>
      );
    }
    case "net-cube": {
      const s = d.side ?? 4;
      const q = 34;
      const x0 = 200 / 2 - 2 * q, y0 = 68;
      const squares: [number, number][] = [
        [x0, y0], [x0 + q, y0], [x0 + 2 * q, y0], [x0 + 3 * q, y0],
        [x0 + q, y0 - q], [x0 + q, y0 + q],
      ];
      return (
        <svg viewBox={`0 0 ${W} ${H}`} width="200" height="170" role="img" aria-label="cube net">
          {squares.map(([sx, sy], i) => (
            <rect key={i} x={sx} y={sy} width={q} height={q}
              fill="rgba(37,99,235,0.10)" stroke={INK} strokeWidth={1.4} />
          ))}
          {label(x0 + q / 2, y0 + q + 16, `side = ${s}`)}
        </svg>
      );
    }
    default:
      return null;
  }
}

// ── Scatter plot ──────────────────────────────────────────────────────────────

function MSScatterPlotSVG(p: MSScatterPlotParams) {
  const W = 200;
  const H = 190;
  const padL = 30, padB = 30, padT = 12, padR = 12;
  const pw = W - padL - padR;
  const ph = H - padT - padB;
  const X = (v: number) => padL + (v / p.maxX) * pw;
  const Y = (v: number) => padT + ph - (v / p.maxY) * ph;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="200" height="190" role="img" aria-label="scatter plot">
      <rect x={padL} y={padT} width={pw} height={ph} fill="#fff" stroke={INK} strokeWidth={1.2} />
      {p.trendline && (
        <line x1={X(p.trendline.x1)} y1={Y(p.trendline.y1)} x2={X(p.trendline.x2)} y2={Y(p.trendline.y2)}
          stroke={RED} strokeWidth={1.6} />
      )}
      {p.points.map((pt, i) => (
        <circle key={i} cx={X(Math.min(p.maxX, Math.max(0, pt.x)))} cy={Y(Math.min(p.maxY, Math.max(0, pt.y)))}
          r={3} fill={ACCENT} />
      ))}
      <text x={padL + pw / 2} y={H - 8} textAnchor="middle" fontSize={9} fill={INK} fontFamily="serif">
        {p.xLabel}
      </text>
      <text x={10} y={padT + ph / 2} textAnchor="middle" fontSize={9} fill={INK} fontFamily="serif"
        transform={`rotate(-90 10 ${padT + ph / 2})`}>
        {p.yLabel}
      </text>
    </svg>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/** Web SVG renderer for middle-school diagram params. Returns null when absent. */
export function MiddleSchoolDiagram({ params }: { params: MiddleSchoolSVGParams | null | undefined }) {
  if (!params) return null;
  switch (params.kind) {
    case "MSNumberLine":
      return <MSNumberLineSVG {...params} />;
    case "MSCoordinateGrid":
      return <MSCoordinateGridSVG {...params} />;
    case "MSSpinner":
      return <MSSpinnerSVG {...params} />;
    case "MSGeometryFigure":
      return <MSGeometryFigureSVG {...params} />;
    case "MSScatterPlot":
      return <MSScatterPlotSVG {...params} />;
    default:
      return null;
  }
}
