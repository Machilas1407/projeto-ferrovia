import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

export default function AccidentChart() {
  const [tooltip, setTooltip] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const svgRef = useRef(null);

  // ---------------- Dados ----------------
  const accidentData = [
    { year: 2010, accidents: 550, fatalities: 33 },
    { year: 2011, accidents: 1028, fatalities: 117 },
    { year: 2012, accidents: 959, fatalities: 96 },
    { year: 2013, accidents: 870, fatalities: 127 },
    { year: 2014, accidents: 833, fatalities: 102 },
    { year: 2015, accidents: 926, fatalities: 105 },
    { year: 2016, accidents: 693, fatalities: 87 },
    { year: 2017, accidents: 773, fatalities: 96 },
    { year: 2018, accidents: 856, fatalities: 121 },
    { year: 2019, accidents: 843, fatalities: 116 },
    { year: 2020, accidents: 735, fatalities: 111 },
    { year: 2021, accidents: 746, fatalities: 100 },
    { year: 2022, accidents: 782, fatalities: 113 },
    { year: 2023, accidents: 728, fatalities: 120 },
    { year: 2024, accidents: 666, fatalities: 114 }
  ];

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ---------------- Layout (margens menores no mobile) ----------------
  const VB_W = 1200;
  const VB_H = 360;

  const MARGINS = useMemo(
    () => (isMobile
      ? { left: 36, right: 18, top: 26, bottom: 54 } // mobile compacto
      : { left: 70, right: 60, top: 36, bottom: 64 } // desktop confortável
    ),
    [isMobile]
  );

  const X0 = MARGINS.left,  X1 = VB_W - MARGINS.right;
  const Y0 = MARGINS.top,   Y1 = VB_H - MARGINS.bottom;
  const CHART_W = X1 - X0;
  const CHART_H = Y1 - Y0;

  const maxAccidents  = useMemo(() => Math.max(...accidentData.map(d => d.accidents)), []);
  const maxFatalities = useMemo(() => Math.max(...accidentData.map(d => d.fatalities)), []);

  const stepX = useMemo(() => CHART_W / (accidentData.length - 1), [CHART_W, accidentData.length]);
  const xAt   = (i) => X0 + i * stepX;
  const yAcc  = (v) => Y1 - (v / maxAccidents)  * CHART_H;
  const yFat  = (v) => Y1 - (v / maxFatalities) * CHART_H;

  // ---------------- Transform (zoom/pan) ----------------
  // x' = tx + scale * x   (aplica só no eixo X)
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);

  useEffect(() => { if (isMobile) setTx(0); }, [isMobile]);

  const MIN_SCALE = 1, MAX_SCALE = 4;

  // Limites de pan (desktop)
  const boundsFor = (s) => ({ minTx: X1 * (1 - s), maxTx: X0 * (1 - s) });
  const clampTx = (t, s) => {
    const { minTx, maxTx } = boundsFor(s);
    return Math.min(maxTx, Math.max(minTx, t));
  };

  // ---------------- Conversões (screen <-> viewBox) ----------------
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
    const xSvg = (xSvgRaw - tx) / scale; // inverso do transform
    const raw = (xSvg - X0) / stepX;
    return Math.min(accidentData.length - 1, Math.max(0, Math.round(raw)));
  }
  function indexToTooltip(idx) {
    const { meet, xOff, yOff } = svgMetrics();
    const d = accidentData[idx];
    const cx = xAt(idx);
    const cy = Math.min(yAcc(d.accidents), yFat(d.fatalities)) - 10;
    const cxT = tx + scale * cx; // aplica transform
    return {
      index: idx, year: d.year, accidents: d.accidents, fatalities: d.fatalities,
      leftPx: xOff + cxT * meet,
      topPx:  yOff + cy  * meet,
    };
  }

  // ---------------- Handlers: tooltip, zoom, pan ----------------
  function handleMove(e) {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY;
    const { xSvg } = clientToSvgXY(clientX, clientY);
    const idx = xSvgToIndex(xSvg);
    setTooltip(indexToTooltip(idx));
  }
  const handleLeave = () => setTooltip(null);

  function applyZoom(factor, xCenterSvg) {
    const sNew = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    let tNew = tx + scale * xCenterSvg - sNew * xCenterSvg;
    if (!isMobile) tNew = clampTx(tNew, sNew); // desktop: limita pan
    else tNew = 0;                              // mobile: pan é via scroll do container
    setScale(sNew);
    setTx(tNew);
  }
  function handleWheel(e) {
    if (!e.ctrlKey) return; // sem Ctrl, não intercepta a rolagem da página
    e.preventDefault();
    const { xSvg } = clientToSvgXY(e.clientX, e.clientY);
    const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    applyZoom(f, xSvg);
  }

  // Pan desktop: drag
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

  // Pinch no mobile (pan é o scroll do container)
  const pinchRef = useRef({ active: false, dist0: 0, s0: 1 });
  function dist(p0,p1){const dx=p0.clientX-p1.clientX, dy=p0.clientY-p1.clientY; return Math.hypot(dx,dy);}
  function onTouchStart(e){
    if (e.touches.length===2){
      pinchRef.current = { active: true, dist0: dist(e.touches[0], e.touches[1]), s0: scale };
    }
  }
  function onTouchMove(e){
    if (pinchRef.current.active && e.touches.length===2){
      e.preventDefault();
      const ratio = dist(e.touches[0], e.touches[1]) / (pinchRef.current.dist0 || 1);
      const sNew = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchRef.current.s0 * ratio));
      setScale(sNew);
      setTx(0);
    }
  }
  function onTouchEnd(){ pinchRef.current.active = false; }

  // ---------------- Geometrias ----------------
  const accPoints = useMemo(() => accidentData.map((d, i) => `${xAt(i)},${yAcc(d.accidents)}`).join(' '), [xAt]);
  const fatPoints = useMemo(() => accidentData.map((d, i) => `${xAt(i)},${yFat(d.fatalities)}`).join(' '), [xAt]);

  // ---------------- Estilos ----------------
  const gridStroke  = 1.2;
  const lineStrokeA = isMobile ? 4.2 : 5.2;
  const lineStrokeF = isMobile ? 3.8 : 4.8;
  const rA = isMobile ? 4.5 : 5.5;
  const rF = isMobile ? 4.2 : 5.2;
  const fontAxis   = isMobile ? 12 : 14;
  const fontLegend = isMobile ? "text-base" : "text-lg";

  // Largura extra no mobile para scroll horizontal sem “faixas brancas”
  const mobileContentWidth = Math.max(900, VB_W * Math.max(1, scale * 1.05));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-center">
          Acidentes Ferroviários e Vítimas Fatais
        </CardTitle>
        <p className="text-center text-gray-600">
          Evolução da segurança no transporte ferroviário brasileiro
        </p>
      </CardHeader>

      <CardContent>
        {/* Desktop: sem scroll | Mobile: scroll-x com conteúdo mais largo e margens reduzidas */}
        <div className={isMobile ? "overflow-x-auto no-scrollbar" : ""}>
          <div
            className="relative"
            style={{ width: isMobile ? `${mobileContentWidth}px` : "100%", height: "420px" }}
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
              {/* GRID (5 linhas) */}
              {[0,1,2,3,4,5].map(i => (
                <line
                  key={i}
                  x1={X0}
                  y1={Y0 + i*(CHART_H/5)}
                  x2={X1}
                  y2={Y0 + i*(CHART_H/5)}
                  stroke="#e5e7eb"
                  strokeWidth={gridStroke}
                />
              ))}

              {/* Eixo Y label */}
              <text
                x={isMobile ? 10 : 18}
                y="180"
                transform={`rotate(-90, ${isMobile ? 10 : 18}, 180)`}
                textAnchor="middle"
                fontSize={12}
                fill="#6b7280"
              >
                Ocorrências / Vítimas
              </text>

              {/* Eixo X (anos) com transform em X */}
              {accidentData.map((d, i) => (
                <text
                  key={d.year}
                  x={tx + scale * xAt(i)}
                  y={Y1 + 24}
                  textAnchor="middle"
                  fontSize={fontAxis}
                  fill="#6b7280"
                >
                  {d.year}
                </text>
              ))}

              {/* Séries com transform (apenas X) */}
              <g transform={`translate(${tx},0) scale(${scale},1)`}>
                <polyline points={accPoints} fill="none" stroke="#ef4444" strokeWidth={lineStrokeA}/>
                {accidentData.map((d,i)=>(
                  <circle key={`a-${i}`} cx={xAt(i)} cy={yAcc(d.accidents)} r={rA} fill="#ef4444"/>
                ))}

                <polyline points={fatPoints} fill="none" stroke="#f97316" strokeWidth={lineStrokeF}/>
                {accidentData.map((d,i)=>(
                  <circle key={`f-${i}`} cx={xAt(i)} cy={yFat(d.fatalities)} r={rF} fill="#f97316"/>
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
                  strokeWidth="1.2"
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
                style={{ left: tooltip.leftPx, top: tooltip.topPx, transform: 'translate(-50%,-110%)', whiteSpace: 'nowrap' }}
              >
                <div className="text-sm font-semibold">{tooltip.year}</div>
                <div className="text-xs text-red-300">Acidentes: {tooltip.accidents.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-orange-300">Vítimas: {tooltip.fatalities}</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"/>
              </div>
            )}
          </div>
        </div>

        {/* Legenda maior */}
        <div className={`mt-6 flex justify-center gap-8 ${fontLegend}`}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            <span className="font-medium text-gray-800">Acidentes</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-orange-500 rounded"></div>
            <span className="font-medium text-gray-800">Vítimas Fatais</span>
          </div>
        </div>

        {/* Cards informativos (mantidos) */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Melhoria em 2024</h4>
            <p className="text-green-800 text-sm">
              <strong>666 acidentes</strong> — redução de 8,5% em relação a 2023.
              Menor número registrado desde 2010.
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">Principais Causas</h4>
            <p className="text-orange-800 text-sm">
              Passagens em nível, falhas humanas, precariedade da via permanente
              e condições climáticas adversas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
