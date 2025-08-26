import React, { useState, useRef } from 'react';
import { Card, CardContent } from "components/ui/card";

export default function CargoMovementChart() {
  const [tooltip, setTooltip] = useState(null);
  const chartRef = useRef(null);

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
    { year: 2024, tu: 541.0, tku: 397.0 }
  ];

  // ViewBox e área útil
  const VB_W = 800, VB_H = 400;
  const X0 = 50, X1 = 750;                 // limites X do gráfico
  const Y0 = 50, Y1 = 350;                 // limites Y do gráfico
  const CHART_W = X1 - X0;                 // 700
  const CHART_H = Y1 - Y0;                 // 300

  const maxTu  = Math.max(...cargoData.map(d => d.tu));
  const maxTku = Math.max(...cargoData.map(d => d.tku));

  // Escalas
  const stepX = CHART_W / (cargoData.length - 1);
  const xAt   = (i) => X0 + i * stepX;
  const yTu   = (v) => Y1 - (v / maxTu)  * CHART_H;
  const yTku  = (v) => Y1 - (v / maxTku) * CHART_H;

  // Compensa letterboxing (preserveAspectRatio="xMidYMid meet")
  function getSvgTransform(rect) {
    const scale = Math.min(rect.width / VB_W, rect.height / VB_H);
    const xOffset = (rect.width  - VB_W * scale) / 2;
    const yOffset = (rect.height - VB_H * scale) / 2;
    return { scale, xOffset, yOffset };
  }

  const handleMouseMove = (event) => {
    const svg = chartRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const { scale, xOffset, yOffset } = getSvgTransform(rect);

    const xPx = event.clientX - rect.left;
    const yPx = event.clientY - rect.top;

    // pixels -> viewBox
    const xSvg = (xPx - xOffset) / scale;
    const ySvg = (yPx - yOffset) / scale; // (não usamos, mantido por clareza)

    // índice mais próximo
    const idx = Math.min(
      cargoData.length - 1,
      Math.max(0, Math.round((xSvg - X0) / stepX))
    );

    const d = cargoData[idx];

    // posição exata (svg)
    const cxSvg = xAt(idx);
    const cySvg = Math.min(yTu(d.tu), yTku(d.tku)) - 10;

    // svg -> pixels (para tooltip DIV)
    const leftPx = xOffset + cxSvg * scale;
    const topPx  = yOffset + cySvg  * scale;

    setTooltip({
      index: idx,
      year: d.year,
      tu: d.tu,
      tku: d.tku,
      leftPx,
      topPx
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  const tuPoints  = cargoData.map((d, i) => `${xAt(i)},${yTu(d.tu)}`).join(' ');
  const tkuPoints = cargoData.map((d, i) => `${xAt(i)},${yTku(d.tku)}`).join(' ');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative h-96">
          <svg
            ref={chartRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid (usando escala de TU só como guia) */}
            {[0, 100, 200, 300, 400, 500, 600].map(val => {
              const y = yTu(val);
              return (
                <g key={val}>
                  <line x1={X0} y1={y} x2={X1} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                  <text x={X0 - 5} y={y + 5} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
                </g>
              );
            })}

            <text x="15" y="200" transform="rotate(-90, 15, 200)" textAnchor="middle" fontSize="12" fill="#6b7280">
              Milhões de TU
            </text>

            {/* Eixo X (anos) */}
            {cargoData.map((d, i) => (
              <text key={d.year} x={xAt(i)} y={Y1 + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
                {d.year}
              </text>
            ))}

            {/* Linhas e pontos */}
            <polyline points={tuPoints}  fill="none" stroke="#3b82f6" strokeWidth="3" />
            {cargoData.map((d, i) => (
              <circle key={`tu-${i}`}  cx={xAt(i)} cy={yTu(d.tu)}  r="4" fill="#3b82f6" />
            ))}

            <polyline points={tkuPoints} fill="none" stroke="#8b5cf6" strokeWidth="3" />
            {cargoData.map((d, i) => (
              <circle key={`tku-${i}`} cx={xAt(i)} cy={yTku(d.tku)} r="4" fill="#8b5cf6" />
            ))}

            {/* Linha vertical alinhada ao índice selecionado */}
            {tooltip && (
              <line
                x1={xAt(tooltip.index)}
                y1={Y0}
                x2={xAt(tooltip.index)}
                y2={Y1}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="4"
              />
            )}

            {/* Área de captura */}
            <rect x="0" y="0" width={VB_W} height={VB_H} fill="transparent" className="cursor-crosshair" />
          </svg>

          {/* Tooltip (em pixels CSS, compensado) */}
          {tooltip && (
            <div
              className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
              style={{
                left: tooltip.leftPx,
                top: tooltip.topPx,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="text-sm font-semibold">{tooltip.year}</div>
              <div className="text-xs text-blue-300">TU: {tooltip.tu.toFixed(1)} M</div>
              <div className="text-xs text-purple-300">TKU: {tooltip.tku.toFixed(1)} B</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Toneladas Úteis (TU)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Toneladas por Km Útil (TKU)</span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Destaque do Minério de Ferro</h4>
            <p className="text-blue-800 text-sm">
              Principal responsável pelo aumento, representando mais de 80% do crescimento em 2024 e mais de 72% do total transportado.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Crescimento Agrícola</h4>
            <p className="text-green-800 text-sm">
              O setor agrícola, de extração vegetal e celulose cresceu duas vezes desde 2010, com destaque para soja, milho e celulose.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
