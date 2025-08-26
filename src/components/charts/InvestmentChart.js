import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { TrendingUp, FileText, Anchor } from 'lucide-react';

export default function InvestmentChart() {
  const [animatedData, setAnimatedData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const chartRef = useRef(null);
  
  // Dados reais de investimento (em R$ milhões)
  const investmentData = [
    { year: 2010, value: 7074 },
    { year: 2011, value: 3883 },
    { year: 2012, value: 2570 },
    { year: 2013, value: 5052 },
    { year: 2014, value: 5587 },
    { year: 2015, value: 3250 },
    { year: 2016, value: 1828 },
    { year: 2017, value: 1033 },
    { year: 2018, value: 1101 },
    { year: 2019, value: 875 },
    { year: 2020, value: 536 },
    { year: 2021, value: 480 },
    { year: 2022, value: 340 },
    { year: 2023, value: 150 },
    { year: 2024, value: 266 }
  ];

  const maxValue = Math.max(...investmentData.map(d => d.value));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(investmentData);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getBarHeight = (value) => {
    return (value / maxValue) * 300; // max height 300px
  };

  const getColor = (year, isHovered) => {
    const baseColor = year === 2024 ? 'bg-green-500' : 
                     year >= 2020 ? 'bg-red-400' : 
                     year >= 2015 ? 'bg-yellow-400' : 'bg-blue-500';
    return isHovered ? baseColor + ' opacity-80 scale-105' : baseColor;
  };

  const handleBarHover = (item, index, event) => {
    setHoveredBar(index);
    const rect = event.currentTarget.getBoundingClientRect();
    const chartRect = chartRef.current.getBoundingClientRect();
    setTooltipData({
      year: item.year,
      value: item.value,
      x: rect.left - chartRect.left + rect.width / 2,
      y: rect.top - chartRect.top - 10
    });
  };

  const handleBarLeave = () => {
    setHoveredBar(null);
    setTooltipData(null);
  };

  return (
    <div className="space-y-8">
      <Card className="w-full">
        <CardContent className="p-6">
          <div ref={chartRef} className="flex items-end justify-between h-80 gap-1 px-4 relative">
            {investmentData.map((item, index) => (
              <div key={item.year} className="flex flex-col items-center h-full justify-end">
                <div
                  className={`w-10 transition-all duration-300 cursor-pointer ${getColor(item.year, hoveredBar === index)} hover:opacity-80 rounded-t`}
                  style={{ 
                    height: `${animatedData[index] ? getBarHeight(item.value) : 0}px`,
                    transitionDelay: `${index * 50}ms`,
                    transform: hoveredBar === index ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => handleBarHover(item, index, e)}
                  onMouseLeave={handleBarLeave}
                />
                <span className="text-xs mt-2 text-gray-500">
                  {item.year}
                </span>
              </div>
            ))}
            
            {/* Tooltip */}
            {tooltipData && (
              <div
                className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
                style={{
                  left: tooltipData.x,
                  top: tooltipData.y,
                  transform: 'translateX(-50%) translateY(-100%)'
                }}
              >
                <div className="text-sm font-semibold">{tooltipData.year}</div>
                <div className="text-xs">R$ {tooltipData.value.toLocaleString('pt-BR')} M</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>2010-2014</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>2015-2019</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>2020-2023</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>2024</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Box de explicação sobre aplicação dos investimentos 2024 */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900">
            Aplicação dos Investimentos em 2024
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800">FIOL (Oeste-Leste)</h4>
                <p className="text-sm text-gray-700">86% do total foi para o trecho II da ferrovia (Caetité-Barreiras/BA).</p>
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