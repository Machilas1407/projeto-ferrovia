import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

export default function AccidentChart() {
  const [animatedData, setAnimatedData] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const chartRef = useRef(null);

  // Dados reais de acidentes
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

  // ViewBox e área útil do gráfico
  const VB_W = 800, VB_H = 300;
  const X0 = 50, X1 = 750;                 // limites horizontais úteis
  const Y0 = 50, Y1 = 250;                 // limites verticais úteis
  const CHART_W = X1 - X0;                 // 700
  const CHART_H = Y1 - Y0;                 // 200

  const maxAccidents = Math.max(...accidentData.map(d => d.accidents));
  const maxFatalities = Math.max(...accidentData.map(d => d.fatalities));

  // Escalas consistentes
  const stepX = CHART_W / (accidentData.length - 1);
  const xAt  = (i) => X0 + i * stepX;
  const yAcc = (v) => Y1 - (v / maxAccidents) * CHART_H;
  const yFat = (v) => Y1 - (v / maxFatalities) * CHART_H;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedData(accidentData), 500);
    return () => clearTimeout(t);
  }, []);

  // Converte levando em conta o "letterbox" (xMidYMid meet)
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

    // posição do mouse dentro da área renderizada (sem as faixas laterais)
    const xPx = event.clientX - rect.left;
    const yPx = event.clientY - rect.top;

    // Pixels → coordenadas do viewBox
    const xSvg = (xPx - xOffset) / scale;
    const ySvg = (yPx - yOffset) / scale;

    // Índice do ponto mais próximo
    const idx = Math.min(
      accidentData.length - 1,
      Math.max(0, Math.round((xSvg - X0) / stepX))
    );

    const d = accidentData[idx];

    // Posição exata do ponto (em SVG)
    const cxSvg = xAt(idx);
    const cySvg = Math.min(yAcc(d.accidents), yFat(d.fatalities)) - 10;

    // SVG → pixels (para posicionar a DIV do tooltip)
    const leftPx = xOffset + cxSvg * scale;
    const topPx  = yOffset + cySvg  * scale;

    setTooltipData({
      index: idx,
      year: d.year,
      accidents: d.accidents,
      fatalities: d.fatalities,
      leftPx,
      topPx
    });
  };

  const handleMouseLeave = () => setTooltipData(null);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Acidentes Ferroviários e Vítimas Fatais
          </CardTitle>
          <p className="text-center text-gray-600">
            Evolução da segurança no transporte ferroviário brasileiro
          </p>
        </CardHeader>

        <CardContent>
          <div className="relative h-80">
            <svg
              ref={chartRef}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              // preserveAspectRatio padrão é xMidYMid meet (manter)
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Grid */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line
                  key={i}
                  x1={X0}
                  y1={Y0 + i * (CHART_H / 5)}
                  x2={X1}
                  y2={Y0 + i * (CHART_H / 5)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Linhas */}
              <polyline
                points={accidentData.map((d, i) => `${xAt(i)},${yAcc(d.accidents)}`).join(' ')}
                fill="none" stroke="#ef4444" strokeWidth="3"
              />
              <polyline
                points={accidentData.map((d, i) => `${xAt(i)},${yFat(d.fatalities)}`).join(' ')}
                fill="none" stroke="#f97316" strokeWidth="3"
              />

              {/* Pontos + anos */}
              {animatedData.map((d, i) => (
                <g key={d.year}>
                  <circle cx={xAt(i)} cy={yAcc(d.accidents)} r="4" fill="#ef4444" />
                  <circle cx={xAt(i)} cy={yFat(d.fatalities)} r="4" fill="#f97316" />
                  <text x={xAt(i)} y={Y1 + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
                    {d.year}
                  </text>
                </g>
              ))}

              {/* Linha vertical alinhada ao ponto selecionado */}
              {tooltipData && (
                <line
                  x1={xAt(tooltipData.index)}
                  y1={Y0}
                  x2={xAt(tooltipData.index)}
                  y2={Y1}
                  stroke="#9ca3af"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              )}

              {/* Área de captura */}
              <rect x="0" y="0" width={VB_W} height={VB_H} fill="transparent" className="cursor-crosshair" />
            </svg>

            {/* Tooltip (em pixels CSS, compensando as margens internas) */}
            {tooltipData && (
              <div
                className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
                style={{
                  left: tooltipData.leftPx,
                  top: tooltipData.topPx,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="text-sm font-semibold">{tooltipData.year}</div>
                <div className="text-xs text-red-300">
                  Acidentes: {tooltipData.accidents.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-orange-300">
                  Vítimas: {tooltipData.fatalities}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Legenda */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Acidentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Vítimas Fatais</span>
            </div>
          </div>

          {/* Cards informativos */}
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
    </>
  );
}
