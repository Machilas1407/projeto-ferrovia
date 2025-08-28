import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Package, Truck, Ship, Box, Container, ArrowRight } from 'lucide-react';

export default function ContainerChart() {
  // ---------------- Dados ----------------
  const containerData = [
    { year: 2010, tu: 2.6, tku: 1.8 },
    { year: 2011, tu: 2.4, tku: 1.6 },
    { year: 2012, tu: 2.4, tku: 1.7 },
    { year: 2013, tu: 2.9, tku: 2.3 },
    { year: 2014, tu: 3.6, tku: 2.7 },
    { year: 2015, tu: 3.5, tku: 2.3 },
    { year: 2016, tu: 3.7, tku: 2.4 },
    { year: 2017, tu: 3.8, tku: 2.8 },
    { year: 2018, tu: 4.3, tku: 3.1 },
    { year: 2019, tu: 5.1, tku: 3.7 },
    { year: 2020, tu: 5.1, tku: 3.7 },
    { year: 2021, tu: 5.3, tku: 4.2 },
    { year: 2022, tu: 5.7, tku: 4.5 },
    { year: 2023, tu: 5.9, tku: 4.4 },
    { year: 2024, tu: 6.3, tku: 4.9 },
  ];

  // ---------------- Estado/refs ----------------
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // transform horizontal x' = tx + s*x
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isMobile) setTx(0); // mobile: pan é via scroll, não via transform
  }, [isMobile]);

  // ---------------- Layout SVG (margens menores no mobile) ----------------
  const VB_W = 1200;
  const VB_H = 360;

  const MARGINS = useMemo(
    () =>
      isMobile
        ? { left: 36, right: 18, top: 26, bottom: 52 } // compacto no mobile
        : { left: 70, right: 60, top: 36, bottom: 64 }, // confortável no desktop
    [isMobile]
  );

  const X0 = MARGINS.left,
    X1 = VB_W - MARGINS.right;
  const Y0 = MARGINS.top,
    Y1 = VB_H - MARGINS.bottom;
  const CHART_W = X1 - X0;
  const CHART_H = Y1 - Y0;

  const maxTu = useMemo(() => Math.max(...containerData.map((d) => d.tu)), []);
  const maxTku = useMemo(() => Math.max(...containerData.map((d) => d.tku)), []);

  const stepX = useMemo(() => CHART_W / (containerData.length - 1), [CHART_W, containerData.length]);
  const xAt = (i) => X0 + i * stepX;
  const yTu = (v) => Y1 - (v / maxTu) * CHART_H;
  const yTku = (v) => Y1 - (v / maxTku) * CHART_H;

  // ---------------- Util de coordenadas ----------------
  function svgMetrics() {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const meet = Math.min(rect.width / VB_W, rect.height / VB_H);
    const xOff = (rect.width - VB_W * meet) / 2;
    const yOff = (rect.height - VB_H * meet) / 2;
    return { rect, meet, xOff, yOff };
  }
  function clientToSvgXY(clientX, clientY) {
    const { rect, meet, xOff, yOff } = svgMetrics();
    return {
      xSvg: (clientX - rect.left - xOff) / meet,
      ySvg: (clientY - rect.top - yOff) / meet,
      meet,
      xOff,
      yOff,
    };
  }
  function xSvgToIndex(xSvgRaw) {
    const xSvg = (xSvgRaw - tx) / scale; // inverso do transform
    const raw = (xSvg - X0) / stepX;
    return Math.min(containerData.length - 1, Math.max(0, Math.round(raw)));
  }
  function indexToTooltip(idx) {
    const { meet, xOff, yOff } = svgMetrics();
    const d = containerData[idx];
    const cx = xAt(idx);
    const cy = Math.min(yTu(d.tu), yTku(d.tku)) - 10;
    const cxT = tx + scale * cx; // aplica transform em X
    return {
      index: idx,
      year: d.year,
      tu: d.tu,
      tku: d.tku,
      leftPx: xOff + cxT * meet,
      topPx: yOff + cy * meet,
    };
  }

  // ---------------- Tooltip (hover/scrub) ----------------
  function handleMove(e) {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY;
    const { xSvg } = clientToSvgXY(clientX, clientY);
    const idx = xSvgToIndex(xSvg);
    setTooltip(indexToTooltip(idx));
  }
  const handleLeave = () => setTooltip(null);

  // ---------------- Zoom & Pan ----------------
  const MIN_SCALE = 1,
    MAX_SCALE = 4;

  // desktop: pan por drag (limitado); mobile: pan via scroll (tx=0)
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
    if (!isMobile) tNew = clampTx(tNew, sNew);
    else tNew = 0; // mobile não usa pan via transform
    setScale(sNew);
    setTx(tNew);
  }

  function handleWheel(e) {
    if (!e.ctrlKey) return; // sem Ctrl, rolagem normal
    e.preventDefault();
    const { xSvg } = clientToSvgXY(e.clientX, e.clientY);
    const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
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
    setTx((prev) => clampTx(dragRef.current.tx0 + delta, scale));
  }
  function onMouseUp() {
    dragRef.current.active = false;
  }

  // mobile pinch-zoom (pan = scroll do container)
  const pinchRef = useRef({ active: false, dist0: 0, s0: 1 });
  function dist(p0, p1) {
    const dx = p0.clientX - p1.clientX,
      dy = p0.clientY - p1.clientY;
    return Math.hypot(dx, dy);
  }
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      pinchRef.current = { active: true, dist0: dist(e.touches[0], e.touches[1]), s0: scale };
    }
  }
  function onTouchMove(e) {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault();
      const ratio = dist(e.touches[0], e.touches[1]) / (pinchRef.current.dist0 || 1);
      const sNew = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchRef.current.s0 * ratio));
      setScale(sNew);
      setTx(0); // mobile não usa pan via transform
    }
  }
  function onTouchEnd() {
    pinchRef.current.active = false;
  }

  // ---------------- Geometrias ----------------
  const tuPoints = useMemo(() => containerData.map((d, i) => `${xAt(i)},${yTu(d.tu)}`).join(' '), [xAt]);
  const tkuPoints = useMemo(() => containerData.map((d, i) => `${xAt(i)},${yTku(d.tku)}`).join(' '), [xAt]);

  // ---------------- Estilos ----------------
  const gridStroke = 1.2;
  const lineStrokeTU = isMobile ? 4 : 5;
  const lineStrokeTKU = isMobile ? 3.6 : 4.6;
  const rTU = isMobile ? 4.5 : 5.5;
  const rTKU = isMobile ? 4.2 : 5.2;
  const fontAxis = isMobile ? 12 : 14;
  const fontLegend = isMobile ? 'text-base' : 'text-lg';

  // Largura extra só no mobile (para scroll horizontal sem sobrar branco)
  const mobileContentWidth = Math.max(900, VB_W * Math.max(1, scale * 1.05));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Container className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-3xl font-bold text-gray-900">Movimentação de Contêineres</CardTitle>
              <Container className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xl text-gray-600">Crescimento sustentado na movimentação ferroviária de contêineres</p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop: sem scroll | Mobile: scroll-x com largura maior e margens reduzidas */}
          <div className={isMobile ? 'overflow-x-auto no-scrollbar' : ''}>
            <div
              className="relative"
              style={{ width: isMobile ? `${mobileContentWidth}px` : '100%', height: '420px' }}
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
                {/* GRID + eixo Y (0..7 usando TU como referência) */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => {
                  const y = yTu(val);
                  return (
                    <g key={val}>
                      <line x1={X0} y1={y} x2={X1} y2={y} stroke="#e5e7eb" strokeWidth={gridStroke} />
                      <text x={X0 - 8} y={y + 4} textAnchor="end" fontSize={fontAxis} fill="#6b7280">
                        {val}
                      </text>
                    </g>
                  );
                })}
                <text
                  x={isMobile ? 10 : 18}
                  y="180"
                  transform={`rotate(-90, ${isMobile ? 10 : 18}, 180)`}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#6b7280"
                >
                  Milhões de TU
                </text>

                {/* Eixo X (anos) com transform em X */}
                {containerData.map((d, i) => (
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

                {/* Séries (apenas X transformado) */}
                <g transform={`translate(${tx},0) scale(${scale},1)`}>
                  <polyline points={tuPoints} fill="none" stroke="#10b981" strokeWidth={lineStrokeTU} />
                  {containerData.map((d, i) => (
                    <circle key={`tu-${i}`} cx={xAt(i)} cy={yTu(d.tu)} r={rTU} fill="#10b981" />
                  ))}

                  <polyline points={tkuPoints} fill="none" stroke="#0ea5e9" strokeWidth={lineStrokeTKU} opacity={0.96} />
                  {containerData.map((d, i) => (
                    <circle key={`tku-${i}`} cx={xAt(i)} cy={yTku(d.tku)} r={rTKU} fill="#0ea5e9" />
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
                <rect x="0" y="0" width={VB_W} height={VB_H} fill="transparent" className="cursor-crosshair" />
              </svg>

              {/* Tooltip */}
              {tooltip && (
                <div
                  className="absolute z-10 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-none"
                  style={{
                    left: tooltip.leftPx,
                    top: tooltip.topPx,
                    transform: 'translate(-50%,-110%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div className="text-sm font-semibold">{tooltip.year}</div>
                  <div className="text-xs text-emerald-300">TU: {tooltip.tu.toFixed(1)} M</div>
                  <div className="text-xs text-sky-300">TKU: {tooltip.tku.toFixed(1)} B</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          </div>

          {/* Legenda maior */}
          <div className={`mt-4 flex justify-center gap-8 ${fontLegend}`}>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-emerald-500 rounded"></div>
              <span className="font-medium text-gray-800">Milhões de Toneladas Úteis (TU)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-sky-500 rounded"></div>
              <span className="font-medium text-gray-800">Bilhões de TKU</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principais Rotas Ferroviárias de Contêineres (mantido) */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <Box className="w-5 h-5" />
              Rondonópolis - Cubatão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-800">MT → SP</span>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">13% do total</span>
            </div>
            <p className="text-sm text-blue-700">
              Maior terminal de grãos da América Latina. Concentra o escoamento das safras do Centro-Oeste para o Porto de Santos via Rumo Malha Norte.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-green-900 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Ortigueira - D. Pedro II
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-800">PR → PR</span>
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">10% do total</span>
            </div>
            <p className="text-sm text-green-700">
              Projeto intermodal da Klabin para exportação de papel e celulose. Conecta fábrica de 2,5 milhões ton/ano ao TCP via Brado Logística.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Rondonópolis - Boa Vista Velha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-800">MT → SP</span>
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">7% do total</span>
            </div>
            <p className="text-sm text-orange-700">
              Rota em crescimento desde 2016. Operação conjunta entre Rumo Malha Paulista (RMP) e Ferrovia Centro Atlântico (FCA) em Campinas.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Cambé/Cascavel - D. Pedro II
            </CardTitle>
          </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-800">PR → PR</span>
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">Cargas refrigeradas</span>
            </div>
            <p className="text-sm text-purple-700">
              Terminais intermodais especializados em cargas refrigeradas, principalmente frango, além de café e fertilizantes da região.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-teal-900 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Criciúma - Imbituba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-teal-800">SC → SC</span>
              <span className="bg-teal-600 text-white px-2 py-1 rounded text-xs">+26% ano</span>
            </div>
            <p className="text-sm text-teal-700">
              Via Ferrovia Tereza Cristina (FTC). Transporta arroz, contêineres vazios e outros produtos para o Porto de Imbituba.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
