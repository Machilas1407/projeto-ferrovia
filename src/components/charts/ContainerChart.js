import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Package, Truck, Ship, Box, Container, ArrowRight } from 'lucide-react';

export default function ContainerChart() {
  const [tooltip, setTooltip] = useState(null);
  const [ready, setReady] = useState(false);
  const chartRef = useRef(null);

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

  const VB_W = 800, VB_H = 300;
  const X0 = 50, X1 = 750;                 // área útil X
  const Y0 = 50, Y1 = 250;                 // área útil Y
  const CHART_W = X1 - X0;                 // 700
  const CHART_H = Y1 - Y0;                 // 200

  const maxTu  = Math.max(...containerData.map(d => d.tu));
  const maxTku = Math.max(...containerData.map(d => d.tku));

  // Escalas consistentes
  const stepX = CHART_W / (containerData.length - 1);
  const xAt   = (i) => X0 + i * stepX;
  const yTu   = (v) => Y1 - (v / maxTu)  * CHART_H;
  const yTku  = (v) => Y1 - (v / maxTku) * CHART_H;

  useEffect(() => {
    const t = setTimeout(()=>setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

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

    // Pixels -> viewBox
    const xSvg = (xPx - xOffset) / scale;
    const ySvg = (yPx - yOffset) / scale; // (não usamos, mas deixei para referência)

    // Índice mais próximo dentro da área útil
    const idx = Math.min(
      containerData.length - 1,
      Math.max(0, Math.round((xSvg - X0) / stepX))
    );

    const d = containerData[idx];

    // Coordenadas SVG do alvo
    const cxSvg = xAt(idx);
    const cySvg = Math.min(yTu(d.tu), yTku(d.tku)) - 10;

    // viewBox -> pixels (para a DIV do tooltip)
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

  const tuPoints  = containerData.map((d, i) => `${xAt(i)},${yTu(d.tu)}`).join(' ');
  const tkuPoints = containerData.map((d, i) => `${xAt(i)},${yTku(d.tku)}`).join(' ');

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
          <div className="relative h-96">
            <svg
              ref={chartRef}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Grid + labels eixo Y (0..7 para TU só como guia) */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(val => {
                const y = yTu(val);
                return (
                  <g key={val}>
                    <line x1={X0} y1={y} x2={X1} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                    <text x={X0 - 5} y={y + 5} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
                  </g>
                );
              })}

              <text x="15" y="125" transform="rotate(-90, 15, 125)" textAnchor="middle" fontSize="12" fill="#6b7280">Milhões de TU</text>

              {/* Anos no eixo X */}
              {containerData.map((d, i) => (
                <text key={d.year} x={xAt(i)} y={Y1 + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
                  {d.year}
                </text>
              ))}

              {/* Linhas e pontos */}
              <polyline points={tuPoints}  fill="none" stroke="#10b981" strokeWidth="3" />
              {ready && containerData.map((d, i) => (
                <circle key={`tu-${i}`}  cx={xAt(i)} cy={yTu(d.tu)}   r="4" fill="#10b981" />
              ))}

              <polyline points={tkuPoints} fill="none" stroke="#0ea5e9" strokeWidth="3" />
              {ready && containerData.map((d, i) => (
                <circle key={`tku-${i}`} cx={xAt(i)} cy={yTku(d.tku)} r="4" fill="#0ea5e9" />
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

            {/* Tooltip (em pixels CSS, já compensado) */}
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
                <div className="text-xs text-emerald-300">TU: {tooltip.tu.toFixed(1)} M</div>
                <div className="text-xs text-sky-300">TKU: {tooltip.tku.toFixed(1)} B</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Legenda */}
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span>Milhões de Toneladas Úteis (TU)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-sky-500 rounded"></div>
              <span>Bilhões de TKU</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principais Rotas Ferroviárias de Contêineres */}
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
