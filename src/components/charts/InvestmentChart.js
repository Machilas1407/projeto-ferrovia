import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { TrendingUp, FileText, Anchor } from 'lucide-react';

export default function InvestmentChart() {
  const [animatedData, setAnimatedData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const scrollRef = useRef(null);          // wrapper com overflow-x no mobile
  const innerRefDesktop = useRef(null);    // container RELATIVE (desktop)
  const innerRefMobile  = useRef(null);    // container RELATIVE (mobile)

  const investmentData = [
    { year: 2010, value: 7074 }, { year: 2011, value: 3883 }, { year: 2012, value: 2570 },
    { year: 2013, value: 5052 }, { year: 2014, value: 5587 }, { year: 2015, value: 3250 },
    { year: 2016, value: 1828 }, { year: 2017, value: 1033 }, { year: 2018, value: 1101 },
    { year: 2019, value: 875  }, { year: 2020, value: 536  }, { year: 2021, value: 480  },
    { year: 2022, value: 340  }, { year: 2023, value: 150  }, { year: 2024, value: 266  }
  ];

  const maxValue = Math.max(...investmentData.map(d => d.value));
  const CHART_HEIGHT = 320;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedData(investmentData), 300);
    return () => clearTimeout(t);
  }, []);

  const getBarHeight = (value) => (value / maxValue) * 300; // máx. ~300px
  const getColor = (year, isHovered) => {
    const base =
      year === 2024 ? 'bg-green-500' :
      year >= 2020 ? 'bg-red-400' :
      year >= 2015 ? 'bg-yellow-400' : 'bg-blue-500';
    return isHovered ? `${base} opacity-90` : base;
  };

  // Posição do tooltip: sempre no CENTRO da barra, relativo ao container ativo
  function positionTooltip(item, index, e) {
    const activeInnerRef = isMobile ? innerRefMobile : innerRefDesktop;
    if (!activeInnerRef.current) return;

    const barRect   = e.currentTarget.getBoundingClientRect();
    const innerRect = activeInnerRef.current.getBoundingClientRect();

    const xWithin = (barRect.left - innerRect.left) + (barRect.width / 2);
    const yWithin = (barRect.top  - innerRect.top)  - 10;

    setHoveredBar(index);
    setTooltipData({ year: item.year, value: item.value, x: xWithin, y: yWithin });
  }
  const onEnterOrTouch = (item, index) => (e) => positionTooltip(item, index, e);
  const onLeave = () => { setHoveredBar(null); setTooltipData(null); };

  // medidas mobile
  const BAR_W_MOBILE = 18;
  const GAP_MOBILE = 10;
  const SLOT_W_MOBILE = BAR_W_MOBILE + GAP_MOBILE;
  const contentWidthMobile = investmentData.length * SLOT_W_MOBILE + 16;

  return (
    <div className="space-y-8">
      <Card className="w-full">
        <CardContent className="p-6">

          {/* Render condicional para evitar refs duplicados no DOM */}
          {isMobile ? (
            // --- MOBILE ---
            <div className="overflow-x-auto no-scrollbar" ref={scrollRef}>
              <div
                className="relative flex items-end px-4"
                ref={innerRefMobile}
                style={{ height: CHART_HEIGHT, width: contentWidthMobile }}
              >
                {investmentData.map((item, index) => (
                  <div key={item.year} className="flex flex-col items-center justify-end" style={{ width: SLOT_W_MOBILE }}>
                    <div
                      className={`${getColor(item.year, hoveredBar === index)} rounded-t transition-all duration-300 cursor-pointer`}
                      style={{
                        width: BAR_W_MOBILE,
                        height: `${animatedData[index] ? getBarHeight(item.value) : 0}px`,
                        transitionDelay: `${index * 40}ms`
                      }}
                      onTouchStart={onEnterOrTouch(item, index)}
                      onMouseEnter={onEnterOrTouch(item, index)}
                      onMouseLeave={onLeave}
                    />
                    <span className="text-[10px] mt-1 text-gray-500">{String(item.year).slice(2)}</span>
                  </div>
                ))}

                {tooltipData && (
                  <div
                    className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
                    style={{ left: tooltipData.x, top: tooltipData.y, transform: 'translate(-50%,-100%)' }}
                  >
                    <div className="text-sm font-semibold">{tooltipData.year}</div>
                    <div className="text-xs">R$ {tooltipData.value.toLocaleString('pt-BR')} M</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // --- DESKTOP ---
            <div className="h-80 px-4 relative" ref={innerRefDesktop}>
              <div className="flex items-end justify-between h-full gap-1">
                {investmentData.map((item, index) => (
                  <div key={item.year} className="flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-10 rounded-t transition-all duration-300 cursor-pointer ${getColor(item.year, hoveredBar === index)} hover:opacity-80`}
                      style={{
                        height: `${animatedData[index] ? getBarHeight(item.value) : 0}px`,
                        transitionDelay: `${index * 50}ms`,
                        transform: hoveredBar === index ? 'translateY(-2px)' : 'translateY(0)'
                      }}
                      onMouseEnter={onEnterOrTouch(item, index)}
                      onMouseLeave={onLeave}
                    />
                    <span className="text-xs mt-2 text-gray-500">{item.year}</span>
                  </div>
                ))}
              </div>

              {tooltipData && (
                <div
                  className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
                  style={{ left: tooltipData.x, top: tooltipData.y, transform: 'translate(-50%,-100%)' }}
                >
                  <div className="text-sm font-semibold">{tooltipData.year}</div>
                  <div className="text-xs">R$ {tooltipData.value.toLocaleString('pt-BR')} M</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )}

          {/* Legenda */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded" /> <span>2010–2014</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded" /> <span>2015–2019</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-400 rounded" /> <span>2020–2023</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /> <span>2024</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Box informativo 2024 (inalterado) */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900">Aplicação dos Investimentos em 2024</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800">FIOL (Oeste-Leste)</h4>
                <p className="text-sm text-gray-700">86% do total foi para o trecho II da ferrovia (Caetité–Barreiras/BA).</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800">Ramal de Barra Mansa (RJ)</h4>
                <p className="text-sm text-gray-700">Mais de R$ 18 milhões investidos na adequação do ramal.</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-3">
              <Anchor className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-800">FICO (Centro-Oeste)</h4>
                <p className="text-sm text-gray-700">Mais de R$ 8 milhões em aportes para o trecho Mara Rosa (GO) a Porto Velho (RO).</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
