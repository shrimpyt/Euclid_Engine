// PdfMiddleSchoolDiagrams.tsx
// @react-pdf/renderer diagram renderers for the middle-school area — the PDF
// twin of MiddleSchoolDiagrams.tsx. Every kind in the web renderer has a
// matching exporter here; keep them in sync.

import React from "react";
import { Svg, Circle, Line, Path, Text, Polygon, Rect, Ellipse } from "@react-pdf/renderer";
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
const SERIF = "Times-Roman";
const SERIF_BOLD = "Times-Bold";

function PdfLabel({ x, y, text, anchor = "middle", size = 9 }: {
  x: number; y: number; text: string; anchor?: "middle" | "start"; size?: number;
}) {
  return (
    <Text
      x={anchor === "middle" ? x - 3 : x}
      y={y + 3}
      style={{ fontSize: size, fontFamily: SERIF_BOLD, color: INK }}
    >
      {text}
    </Text>
  );
}

// ── Number line ───────────────────────────────────────────────────────────────

export function PdfMSNumberLineSVG(p: MSNumberLineParams) {
  const W = 200;
  const H = 64;
  const pad = 14;
  const span = p.max - p.min || 1;
  const x = (v: number) => pad + ((v - p.min) / span) * (W - 2 * pad);
  const yMid = 30;
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="64">
      <Line x1={pad - 6} y1={yMid} x2={W - pad + 6} y2={yMid} stroke={INK} strokeWidth={1.5} />
      {p.marks.map((v) => (
        <React.Fragment key={v}>
          <Line x1={x(v)} y1={yMid - 5} x2={x(v)} y2={yMid + 5} stroke={INK} strokeWidth={1} />
          <Text x={x(v) - 3} y={yMid + 19} style={{ fontSize: 9, fontFamily: SERIF, color: INK }}>
            {String(v)}
          </Text>
        </React.Fragment>
      ))}
      {p.highlight.map((v) => (
        <Circle key={`h${v}`} cx={x(v)} cy={yMid} r={4} fill={RED} />
      ))}
      {(p.openHighlight ?? []).map((v) => (
        <Circle key={`o${v}`} cx={x(v)} cy={yMid} r={4} fill="#ffffff" stroke={RED} strokeWidth={2} />
      ))}
      {p.ray && (
        <React.Fragment>
          <Line
            x1={x(p.ray.from)}
            y1={yMid}
            x2={p.ray.dir === "right" ? W - pad + 2 : pad - 2}
            y2={yMid}
            stroke={ACCENT}
            strokeWidth={3}
          />
          <Circle
            cx={x(p.ray.from)}
            cy={yMid}
            r={4.5}
            fill={p.ray.open ? "#ffffff" : ACCENT}
            stroke={ACCENT}
            strokeWidth={2}
          />
        </React.Fragment>
      )}
    </Svg>
  );
}

// ── Coordinate grid ───────────────────────────────────────────────────────────

export function PdfMSCoordinateGridSVG(p: MSCoordinateGridParams) {
  const W = 200;
  const H = 200;
  const pad = 16;
  const spanX = p.maxX - p.minX || 1;
  const spanY = p.maxY - p.minY || 1;
  const X = (v: number) => pad + ((v - p.minX) / spanX) * (W - 2 * pad);
  const Y = (v: number) => H - pad - ((v - p.minY) / spanY) * (H - 2 * pad);
  const lines: React.ReactNode[] = [];
  for (let gx = Math.ceil(p.minX); gx <= p.maxX; gx++) {
    lines.push(
      <Line key={`v${gx}`} x1={X(gx)} y1={pad} x2={X(gx)} y2={H - pad}
        stroke={gx === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={gx === 0 ? 1.2 : 0.6} />
    );
  }
  for (let gy = Math.ceil(p.minY); gy <= p.maxY; gy++) {
    lines.push(
      <Line key={`h${gy}`} x1={pad} y1={Y(gy)} x2={W - pad} y2={Y(gy)}
        stroke={gy === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={gy === 0 ? 1.2 : 0.6} />
    );
  }
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="200">
      {lines}
      {(p.polygons ?? []).map((poly, i) => (
        <React.Fragment key={`poly${i}`}>
          <Polygon
            points={poly.points.map((pt) => `${X(pt.x)},${Y(pt.y)}`).join(" ")}
            fill={ACCENT}
            fillOpacity={0.12}
            stroke={poly.dashed ? RED : ACCENT}
            strokeWidth={1.5}
            strokeDasharray={poly.dashed ? "5,3" : undefined}
          />
          {poly.label && (
            <Text x={X(poly.points[0].x)} y={Y(poly.points[0].y) - 8}
              style={{ fontSize: 10, fontFamily: SERIF_BOLD, color: INK }}>
              {poly.label}
            </Text>
          )}
        </React.Fragment>
      ))}
      {(p.segments ?? []).map((s, i) => (
        <Line key={`seg${i}`} x1={X(s.x1)} y1={Y(s.y1)} x2={X(s.x2)} y2={Y(s.y2)}
          stroke="#b45309" strokeWidth={1.6} strokeDasharray={s.dashed ? "5,3" : undefined} />
      ))}
      {(p.points ?? []).map((pt, i) => (
        <React.Fragment key={`pt${i}`}>
          <Circle cx={X(pt.x)} cy={Y(pt.y)} r={4}
            fill={pt.filled === false ? "#ffffff" : INK} stroke={INK} strokeWidth={1.5} />
          {pt.label && (
            <Text x={X(pt.x) + 6} y={Y(pt.y) - 2}
              style={{ fontSize: 10, fontFamily: SERIF_BOLD, color: INK }}>
              {pt.label}
            </Text>
          )}
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

const SPINNER_DEFAULT_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#f97316", "#14b8a6", "#f43f5e"];

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function PdfMSSpinnerSVG(p: MSSpinnerParams) {
  const C = 100;
  const R = 78;
  const n = p.sectors.length;
  const colors = p.colors && p.colors.length >= n ? p.colors : SPINNER_DEFAULT_COLORS;
  const step = 360 / n;
  return (
    <Svg viewBox="0 0 200 200" width="200" height="200">
      {p.sectors.map((label, i) => {
        const a0 = i * step;
        const a1 = (i + 1) * step;
        const s = polar(C, C, R, a0);
        const e = polar(C, C, R, a1);
        const large = step > 180 ? 1 : 0;
        const mid = polar(C, C, R * 0.62, (a0 + a1) / 2);
        return (
          <React.Fragment key={i}>
            <Path
              d={`M ${C} ${C} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`}
              fill={colors[i % colors.length]}
              fillOpacity={0.75}
              stroke={INK}
              strokeWidth={1.2}
            />
            <Text x={mid.x - 4} y={mid.y + 4}
              style={{ fontSize: 13, fontFamily: SERIF_BOLD, color: "#ffffff" }}>
              {label}
            </Text>
          </React.Fragment>
        );
      })}
      <Circle cx={C} cy={C} r={7} fill={INK} />
      <Circle cx={C} cy={C} r={2.5} fill="#ffffff" />
    </Svg>
  );
}

// ── Geometric figures ─────────────────────────────────────────────────────────

export function PdfMSGeometryFigureSVG(p: MSGeometryFigureParams) {
  const W = 200;
  const H = 170;
  const d = p.dims;
  const label = (x: number, y: number, text: string) => (
    <PdfLabel x={x} y={y} text={text} />
  );

  switch (p.figure) {
    case "parallelogram": {
      const base = d.base ?? 8;
      const height = d.height ?? 5;
      const skew = 28;
      const x0 = 40, y1 = 120;
      const x1 = x0 + 120, y0 = y1 - 80;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Polygon points={`${x0 + skew},${y0} ${x1 + skew},${y0} ${x1},${y1} ${x0},${y1}`}
            fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Line x1={x0 + skew} y1={y0} x2={x0 + skew} y2={y1} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label((x0 + x1) / 2 + skew / 2, y1 + 14, `${base}`)}
          {label(x0 + skew - 14, (y0 + y1) / 2, `${height}`)}
        </Svg>
      );
    }
    case "triangle": {
      const base = d.base ?? 8;
      const height = d.height ?? 5;
      const x0 = 40, x1 = 160, yb = 130, yt = 50;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Polygon points={`${x0},${yb} ${x1},${yb} ${x0 + 45},${yt}`}
            fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Line x1={x0 + 45} y1={yt} x2={x0 + 45} y2={yb} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label((x0 + x1) / 2, yb + 14, `${base}`)}
          {label(x0 + 45 + 8, (yt + yb) / 2, `${height}`)}
        </Svg>
      );
    }
    case "trapezoid": {
      const b1 = d.base1 ?? 10;
      const b2 = d.base2 ?? 6;
      const h = d.height ?? 4;
      const cx = 100, yb = 130, yt = 55;
      const w1 = 65, w2 = 38;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Polygon points={`${cx - w2},${yt} ${cx + w2},${yt} ${cx + w1},${yb} ${cx - w1},${yb}`}
            fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Line x1={cx + w2 + 6} y1={yt} x2={cx + w2 + 6} y2={yb} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label(cx, yb + 14, `${b1}`)}
          {label(cx, yt - 10, `${b2}`)}
          {label(cx + w2 + 12, (yt + yb) / 2, `${h}`)}
        </Svg>
      );
    }
    case "rectangle": {
      const l = d.length ?? d.base ?? 8;
      const w = d.width ?? d.height ?? 5;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Rect x={45} y={45} width={110} height={80} fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          {label(100, 140, `${l}`)}
          {label(163, 90, `${w}`)}
        </Svg>
      );
    }
    case "rectangular-prism": {
      const l = d.length ?? 5;
      const w = d.width ?? 4;
      const h = d.height ?? 3;
      const x0 = 55, y0 = 120, fw = 80, fh = 55, dep = 26;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Polygon points={`${x0},${y0} ${x0 + fw},${y0} ${x0 + fw},${y0 - fh} ${x0},${y0 - fh}`}
            fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Polygon points={`${x0 + fw},${y0} ${x0 + fw + dep},${y0 - dep} ${x0 + fw + dep},${y0 - dep - fh} ${x0 + fw},${y0 - fh}`}
            fill={ACCENT} fillOpacity={0.05} stroke={INK} strokeWidth={1.2} />
          <Polygon points={`${x0},${y0 - fh} ${x0 + fw},${y0 - fh} ${x0 + fw + dep},${y0 - dep - fh} ${x0 + dep},${y0 - dep - fh}`}
            fill={ACCENT} fillOpacity={0.05} stroke={INK} strokeWidth={1.2} />
          {label(x0 + fw / 2, y0 + 14, `${l}`)}
          {label(x0 + fw + dep + 2, y0 - dep / 2, `${w}`)}
          {label(x0 - 14, y0 - fh / 2, `${h}`)}
        </Svg>
      );
    }
    case "cylinder": {
      const r = d.radius ?? 3;
      const h = d.height ?? 6;
      const cx = 100, ry = 14, yTop = 45, yBot = 125;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Path d={`M ${cx - 55} ${yTop} L ${cx - 55} ${yBot} A 55 ${ry} 0 0 0 ${cx + 55} ${yBot} L ${cx + 55} ${yTop}`}
            fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Ellipse cx={cx} cy={yTop} rx={55} ry={ry} fill={ACCENT} fillOpacity={0.16} stroke={INK} strokeWidth={1.6} />
          {label(cx + 60, (yTop + yBot) / 2, `${h}`)}
          {label(cx, yTop - 22, `r = ${r}`)}
        </Svg>
      );
    }
    case "cone": {
      const r = d.radius ?? 3;
      const h = d.height ?? 6;
      const cx = 100, apexY = 35, baseY = 125, ry = 12;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Polygon points={`${cx},${apexY} ${cx - 55},${baseY} ${cx + 55},${baseY}`}
            fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Ellipse cx={cx} cy={baseY} rx={55} ry={ry} fill={ACCENT} fillOpacity={0.16} stroke={INK} strokeWidth={1.4} />
          <Line x1={cx} y1={apexY} x2={cx} y2={baseY} stroke={RED} strokeWidth={1.2} strokeDasharray="4,2" />
          {label(cx + 6, (apexY + baseY) / 2, `${h}`)}
          {label(cx, baseY + 24, `r = ${r}`)}
        </Svg>
      );
    }
    case "sphere": {
      const r = d.radius ?? 4;
      const cx = 100, cy = 85, R = 55;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Circle cx={cx} cy={cy} r={R} fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Ellipse cx={cx} cy={cy} rx={R} ry={R * 0.32} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="4,2" />
          <Line x1={cx} y1={cy} x2={cx + R * 0.7} y2={cy - R * 0.7} stroke={INK} strokeWidth={1.2} />
          {label(cx + R * 0.35, cy - R * 0.35 - 8, `r = ${r}`)}
        </Svg>
      );
    }
    case "circle": {
      const cx = 100, cy = 85, R = 58;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Circle cx={cx} cy={cy} r={R} fill={ACCENT} fillOpacity={0.08} stroke={INK} strokeWidth={1.6} />
          <Circle cx={cx} cy={cy} r={2.5} fill={INK} />
          <Line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={INK} strokeWidth={1.2} />
          {d.radius !== undefined && label(cx + R / 2, cy - 10, `r = ${d.radius}`)}
          {d.diameter !== undefined && label(cx, cy + 8, `d = ${d.diameter}`)}
        </Svg>
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
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Line x1={vx} y1={vy} x2={vx + len} y2={vy} stroke={INK} strokeWidth={1.6} />
          <Line x1={vx} y1={vy} x2={ex} y2={ey} stroke={INK} strokeWidth={1.6} />
          <Path d={`M ${vx + 26} ${vy} A 26 26 0 0 0 ${ax} ${ay}`} fill="none" stroke={ACCENT} strokeWidth={1.6} />
          {label(vx + 44, vy - 16, `${ang}°`)}
        </Svg>
      );
    }
    case "angle-complementary": {
      const known = d.angle ?? 35;
      const vx = 55, vy = 125;
      const kRad = ((360 - known) * Math.PI) / 180;
      const kx = vx + 95 * Math.cos(kRad);
      const ky = vy + 95 * Math.sin(kRad);
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Line x1={vx} y1={vy} x2={vx + 100} y2={vy} stroke={INK} strokeWidth={1.6} />
          <Line x1={vx} y1={vy} x2={vx} y2={vy - 100} stroke={INK} strokeWidth={1.6} />
          <Line x1={vx} y1={vy} x2={kx} y2={ky} stroke={ACCENT} strokeWidth={1.6} />
          <Path d={`M ${vx + 12} ${vy} L ${vx + 12} ${vy - 12} L ${vx} ${vy - 12}`} fill="none" stroke={INK} strokeWidth={1.2} />
          {label(vx + 34, vy - 12, `${known}°`)}
          {label(vx + 10, vy - 56, "?")}
        </Svg>
      );
    }
    case "angle-supplementary": {
      const known = d.angle ?? 120;
      const vx = 100, vy = 120;
      const kRad = ((180 - known) * Math.PI) / 180;
      const kx = vx + 90 * Math.cos(kRad);
      const ky = vy - 90 * Math.sin(kRad);
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Line x1={vx - 95} y1={vy} x2={vx + 95} y2={vy} stroke={INK} strokeWidth={1.6} />
          <Line x1={vx} y1={vy} x2={kx} y2={ky} stroke={ACCENT} strokeWidth={1.6} />
          {label(vx - 46, vy - 16, `${known}°`)}
          {label(vx + 40, vy - 16, "?")}
        </Svg>
      );
    }
    case "angle-vertical": {
      const known = d.angle ?? 60;
      const cx = 100, cy = 90, len = 70;
      const rad = ((known / 2) * Math.PI) / 180;
      const dx = len * Math.cos(rad);
      const dy = len * Math.sin(rad);
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Line x1={cx - dx} y1={cy + dy} x2={cx + dx} y2={cy - dy} stroke={INK} strokeWidth={1.6} />
          <Line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke={INK} strokeWidth={1.6} />
          {label(cx + dx * 0.45, cy - dy * 0.45 - 10, `${known}°`)}
          {label(cx - dx * 0.45, cy + dy * 0.45 + 14, "?")}
        </Svg>
      );
    }
    case "composite": {
      const w1 = d.w1 ?? 10, h1 = d.h1 ?? 5, w2 = d.w2 ?? 5, h2 = d.h2 ?? 4;
      const s = Math.min(120 / w1, 60 / h1, 100 / w2, 50 / h2);
      const bw = w1 * s, bh = h1 * s, tw = w2 * s, th = h2 * s;
      const x0 = (200 - bw) / 2, yb = 135;
      const tx0 = x0 + (bw - tw) / 2;
      return (
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          <Rect x={x0} y={yb - bh} width={bw} height={bh} fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          <Rect x={tx0} y={yb - bh - th} width={tw} height={th} fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.6} />
          {label(x0 + bw / 2, yb + 13, `${w1}`)}
          {label(x0 - 12, yb - bh / 2, `${h1}`)}
          {label(tx0 + tw / 2, yb - bh - th - 9, `${w2}`)}
          {label(tx0 + tw + 4, yb - bh - th / 2, `${h2}`)}
        </Svg>
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
        <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="170">
          {squares.map(([sx, sy], i) => (
            <Rect key={i} x={sx} y={sy} width={q} height={q}
              fill={ACCENT} fillOpacity={0.1} stroke={INK} strokeWidth={1.4} />
          ))}
          {label(x0 + q / 2, y0 + q + 14, `side = ${s}`)}
        </Svg>
      );
    }
    default:
      return null;
  }
}

// ── Scatter plot ──────────────────────────────────────────────────────────────

export function PdfMSScatterPlotSVG(p: MSScatterPlotParams) {
  const W = 200;
  const H = 190;
  const padL = 30, padB = 30, padT = 12, padR = 12;
  const pw = W - padL - padR;
  const ph = H - padT - padB;
  const X = (v: number) => padL + (v / p.maxX) * pw;
  const Y = (v: number) => padT + ph - (v / p.maxY) * ph;
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="200" height="190">
      <Rect x={padL} y={padT} width={pw} height={ph} fill="#ffffff" stroke={INK} strokeWidth={1.2} />
      {p.trendline && (
        <Line x1={X(p.trendline.x1)} y1={Y(p.trendline.y1)} x2={X(p.trendline.x2)} y2={Y(p.trendline.y2)}
          stroke={RED} strokeWidth={1.6} />
      )}
      {p.points.map((pt, i) => (
        <Circle key={i}
          cx={X(Math.min(p.maxX, Math.max(0, pt.x)))}
          cy={Y(Math.min(p.maxY, Math.max(0, pt.y)))}
          r={3} fill={ACCENT} />
      ))}
      <Text x={padL + pw / 2 - 20} y={H - 6} style={{ fontSize: 9, fontFamily: SERIF, color: INK }}>
        {p.xLabel}
      </Text>
      <Text x={4} y={padT + ph / 2 + 20} style={{ fontSize: 9, fontFamily: SERIF, color: INK }}>
        {p.yLabel}
      </Text>
    </Svg>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/** PDF SVG renderer for middle-school diagram params. Returns null when absent. */
export function PdfMiddleSchoolDiagram({ params }: { params: MiddleSchoolSVGParams | null | undefined }) {
  if (!params) return null;
  switch (params.kind) {
    case "MSNumberLine":
      return <PdfMSNumberLineSVG {...params} />;
    case "MSCoordinateGrid":
      return <PdfMSCoordinateGridSVG {...params} />;
    case "MSSpinner":
      return <PdfMSSpinnerSVG {...params} />;
    case "MSGeometryFigure":
      return <PdfMSGeometryFigureSVG {...params} />;
    case "MSScatterPlot":
      return <PdfMSScatterPlotSVG {...params} />;
    default:
      return null;
  }
}
