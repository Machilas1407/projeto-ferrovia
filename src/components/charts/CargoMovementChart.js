import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "components/ui/card";

export default function CargoMovementChart() {
  // ---------- dados ----------
  const cargoData = [
    { year: 2010, tu: 435.2, tku: 278.0 },
    { year: 2011, tu: 454.4, tku: 293.3 },
    { year: 2012, tu: 453.2, tku: 298.7 },
    { year: 2013, tu: 450.7, tku: 297.9 },
    { year: 2014, tu: 465.9, tku: 307.2 },
    { year: 2015, tu: 492.8, tku: 341.2 },
    { year: 2016, tu: 505.2, tku: 332.3 },
    { year: 2017, tu: 540.2, tku: 366.4 },
    { year: 2018, tu: 571.6, tku: 407.9 },
    { year: 2019, tu: 489.6, tku: 365.3 },
    { year: 2020, tu: 500.8, tku: 371.4 },
    { year: 2021, tu: 530.6, tku: 371.1 },
    { year: 2022, tu: 540.6, tku: 375.2 },
    { year: 2023, tu: 530.2, tku: 389.5 },
    { year: 2024, tu: 541.0, tku: 397.0 },
  ];

  // ---------- estado/refs ----------
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // transform horizontal x' = tx + s*x
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // quando entrar no mobile, não usamos pan por transform — zera tx
  useEffect(() => {
    if (isMobile) setTx(0);
  }, [isMobile]);

  // ---------- layout SVG (margens menores no mobile) ----------
  const VB_W = 1200;
  const VB_H = 420;

  const MARGINS = useMemo(() => (
    isMobile
      ? { left: 36, right: 18, top: 28, bottom: 56 }   // <<< mais compacto no mobile
      : { left: 70, right: 60, top: 40, bottom: 70 }   // desktop (como estava)
  ), [isMobile]);

  const X0 = MARGINS.left, X1 = VB_W - MARGINS.right;
  const Y0 = MARGINS.top,  Y1 = VB_H - MARGINS.bottom;
  const CHART_W = X1 - X0;
  const CHART_H = Y1 - Y0;

  const maxTu  = useMemo(() => Math.max(...cargoData.map(d => d.tu)), []);
  const maxTku = useMemo(() => Math.max(...cargoData.map(d => d.tku)), []);

  const stepX = useMemo(() => CHART_W / (cargoData.length - 1), [CHART_W, cargoData.length]);
  const xAt   = (i) => X0 + i * stepX;
  const yTu   = (v) => Y1 - (v / maxTu)  * CHART_H;
  const yTku  = (v) => Y1 - (v / maxTku) * CHART_H;

  // ---------- util de coordenadas ----------
  function svgMetrics() {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const meet = Math.min(rect.width / VB_W, rect.height / VB_H);
    const xOff = (rect.width  - VB_W * meet) / 2;
    const yOff = (rect.height - VB_H * meet) / 2;
    return { rect, meet, xOff, yOff };
  }
  function clientToSvgXY(clientX, clientY) {
    const { rect, meet, xOff, yOff } = svgMetrics();
    return {
      xSvg: (clientX - rect.left - xOff) / meet,
      ySvg: (clientY - rect.top  - yOff) / meet,
      meet, xOff, yOff
    };
  }
  function xSvgToIndex(xSvgRaw) {
    const xSvg = (xSvgRaw - tx) / scale;
    const raw = (xSvg - X0) / stepX;
    return Math.min(cargoData.length - 1, Math.max(0, Math.round(raw)));
  }
  function indexToTooltip(idx) {
    const { meet, xOff, yOff } = svgMetrics();
    const d = cargoData[idx];
    const cx = xAt(idx);
    const cy = Math.min(yTu(d.tu), yTku(d.tku)) - 12;
    const cxT = tx + scale * cx; // aplica transform
    return {
      index: idx, year: d.year, tu: d.tu, tku: d.tku,
      leftPx: xOff + cxT * meet,
      topPx:  yOff + cy  * meet,
    };
  }

  // ---------- tooltip (hover/scrub) ----------
  function handleMove(e) {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY;
    const { xSvg } = clientToSvgXY(clientX, clientY);
    const idx = xSvgToIndex(xSvg);
    setTooltip(indexToTooltip(idx));
  }
  const handleLeave = () => setTooltip(null);

  // ---------- zoom ----------
  const MIN_SCALE = 1, MAX_SCALE = 4;

  // desktop: pan por drag; mobile: pan via SCROLL do container (sem tx)
  const boundsFor = (s) => {
    const minTx = X1 * (1 - s);
    const maxTx = X0 * (1 - s);
    return { minTx, maxTx };
  };
  const clampTx = (t, s) => {
    const { minTx, maxTx } = boundsFor(s);
    return Math.min(maxTx, Math.max(minTx, t));
  };

  function applyZoom(factor, xCenterSvg) {
    const sNew = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    let tNew = tx + scale * xCenterSvg - sNew * xCenterSvg;
    if (!isMobile) tNew = clampTx(tNew, sNew);   // desktop: limita pan
    else tNew = 0;                               // mobile: sem pan por transform
    setScale(sNew);
    setTx(tNew);
  }

  function handleWheel(e) {
    if (!e.ctrlKey) return; // sem Ctrl, rolagem normal
    e.preventDefault();
    const { xSvg } = clientToSvgXY(e.clientX, e.clientY);
    const f = e.deltaY < 0 ? 1.1 : 1/1.1;
    applyZoom(f, xSvg);
  }

  // desktop drag-pan
  const dragRef = useRef({ active: false, x0: 0, tx0: 0 });
  function onMouseDown(e) {
    if (isMobile) return;
    e.preventDefault();
    const { xSvg } = clientToSvgXY(e.clientX, e.clientY);
    dragRef.current = { active: true, x0: xSvg, tx0: tx };
  }
  function onMouseMove(e) {
    if (!dragRef.current.active || isMobile) return;
    const { xSvg } = clientToSvgXY(e.clientX, e.clientY);
    const delta = xSvg - dragRef.current.x0;
    setTx(prev => clampTx(dragRef.current.tx0 + delta, scale));
  }
  function onMouseUp() { dragRef.current.active = false; }

  // mobile: pinch-zoom; 1 dedo = scroll do container
  const pinchRef = useRef({ active: false, dist0: 0, cx0: 0, s0: 1, t0: 0 });
  function dist(p0, p1){const dx=p0.clientX-p1.clientX,dy=p0.clientY-p1.clientY;return Math.hypot(dx,dy);}
  function center(p0,p1){return {x:(p0.clientX+p1.clientX)/2,y:(p0.clientY+p1.clientY)/2};}
  function onTouchStart(e){
    if (e.touches.length===2){
      const c=center(e.touches[0],e.touches[1]);
      const {xSvg}=clientToSvgXY(c.x,c.y);
      pinchRef.current={active:true,dist0:dist(e.touches[0],e.touches[1]),cx0:xSvg,s0:scale,t0:tx};
    }
  }
  function onTouchMove(e){
    if (pinchRef.current.active && e.touches.length===2){
      e.preventDefault();
      const r=dist(e.touches[0],e.touches[1])/(pinchRef.current.dist0||1);
      const sNew=Math.max(MIN_SCALE,Math.min(MAX_SCALE,pinchRef.current.s0*r));
      setScale(sNew);
      setTx(0); // mobile: pan é o scroll do container
    }
  }
  function onTouchEnd(){pinchRef.current.active=false;}

  // ---------- paths ----------
  const tuPoints  = useMemo(() => cargoData.map((d, i) => `${xAt(i)},${yTu(d.tu)}`).join(" "), [xAt]);
  const tkuPoints = useMemo(() => cargoData.map((d, i) => `${xAt(i)},${yTku(d.tku)}`).join(" "), [xAt]);

  // estilos
  const gridStroke  = 1.2;
  const lineStroke1 = isMobile ? 4.5 : 5.5;
  const lineStroke2 = isMobile ? 3.8 : 5.0;
  const r1 = isMobile ? 5 : 6;
  const r2 = isMobile ? 4.5 : 5.5;
  const fontAxis   = isMobile ? 12 : 14;
  const fontLegend = isMobile ? "text-base" : "text-lg";

  // largura “expandida” no mobile, mas sem exagero
  const mobileContentWidth = Math.max(900, VB_W * Math.max(1, scale * 1.05)); // <<< menos espaço em branco

  return (
    <Card>
      <CardContent className="p-6">
        {/* DESKTOP: sem scroll; MOBILE: scroll-x com conteúdo mais largo */}
        <div className={isMobile ? "overflow-x-auto no-scrollbar" : ""}>
          <div
            className="relative"
            style={{ width: isMobile ? `${mobileContentWidth}px` : "100%", height: "460px" }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              onWheel={handleWheel}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMoveCapture={onMouseMove}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* GRID / eixo Y */}
              {[0,100,200,300,400,500,600].map(val => {
                const y = yTu(val);
                return (
                  <g key={val}>
                    <line x1={X0} y1={y} x2={X1} y2={y} stroke="#e5e7eb" strokeWidth={gridStroke}/>
                    <text x={X0-8} y={y+4} textAnchor="end" fontSize={fontAxis} fill="#6b7280">{val}</text>
                  </g>
                );
              })}
              <text x={isMobile ? 10 : 18} y="210" transform={`rotate(-90, ${isMobile ? 10 : 18}, 210)`} textAnchor="middle" fontSize={12} fill="#6b7280">
                Milhões de TU
              </text>

              {/* Eixo X (anos) com transform em X */}
              {cargoData.map((d,i) => (
                <text key={d.year} x={tx + scale * xAt(i)} y={Y1 + 24} textAnchor="middle" fontSize={fontAxis} fill="#6b7280">
                  {d.year}
                </text>
              ))}

              {/* Séries (apenas X transformado) */}
              <g transform={`translate(${tx},0) scale(${scale},1)`}>
                <polyline points={tuPoints}  fill="none" stroke="#3b82f6" strokeWidth={lineStroke1}/>
                {cargoData.map((d,i)=>(
                  <circle key={`tu-${i}`} cx={xAt(i)} cy={yTu(d.tu)} r={r1} fill="#3b82f6"/>
                ))}

                <polyline points={tkuPoints} fill="none" stroke="#8b5cf6" strokeWidth={lineStroke2} opacity={0.95}/>
                {cargoData.map((d,i)=>(
                  <circle key={`tku-${i}`} cx={xAt(i)} cy={yTku(d.tku)} r={r2} fill="#8b5cf6"/>
                ))}
              </g>

              {/* Scrubber */}
              {tooltip && (
                <line
                  x1={tx + scale * xAt(tooltip.index)}
                  y1={Y0}
                  x2={tx + scale * xAt(tooltip.index)}
                  y2={Y1}
                  stroke="#9ca3af"
                  strokeWidth="1.4"
                  strokeDasharray="4"
                />
              )}

              {/* Área de captura */}
              <rect x="0" y="0" width={VB_W} height={VB_H} fill="transparent" className="cursor-crosshair"/>
            </svg>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute z-10 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-none"
                style={{ left: tooltip.leftPx, top: tooltip.topPx, transform: "translate(-50%,-110%)", whiteSpace: "nowrap" }}
              >
                <div className="text-sm font-semibold">{tooltip.year}</div>
                <div className="text-xs">TU: {tooltip.tu.toFixed(1)} M</div>
                <div className="text-xs">TKU: {tooltip.tku.toFixed(1)} B</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"/>
              </div>
            )}
          </div>
        </div>

        {/* Legenda maior */}
        <div className={`mt-5 flex flex-wrap justify-center gap-8 ${fontLegend}`}>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded bg-blue-500 inline-block" />
            <span className="font-medium text-gray-800">Toneladas Úteis (TU)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded bg-purple-500 inline-block" />
            <span className="font-medium text-gray-800">Toneladas por Km Útil (TKU)</span>
          </div>
      
        </div>
      </CardContent>
    </Card>
  );
}
