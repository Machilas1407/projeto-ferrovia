import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "components/ui/card";

export default function TimelineSection({ timeline }) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [trainPos, setTrainPos] = useState({ left: 0, top: 0 });

  const sectionRef = useRef(null);
  const trackWrapRef = useRef(null);
  const trackRef = useRef(null);
  const trackCenterRef = useRef(null); // centro real do trilho após transforms
  const trainRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    cardRefs.current = timeline.map(() => React.createRef());

    const update = () => {
      if (!sectionRef.current || !trackWrapRef.current || !trackRef.current || !trainRef.current || !trackCenterRef.current) return;

      // --- Visibilidade dos cards (segue como estava, simples por seção) ---
      const sec = sectionRef.current.getBoundingClientRect();
      const secTop = sec.top + window.scrollY;
      const secH = sec.height;
      const vh = window.innerHeight;
      const secP = Math.max(0, Math.min(1, (window.scrollY - (secTop - vh + 200)) / ((secTop + secH - 200) - (secTop - vh + 200))));
      const newVisible = new Set();
      const itemsToShow = Math.floor(secP * timeline.length * 1.2);
      for (let i = 0; i < Math.min(itemsToShow, timeline.length); i++) newVisible.add(i);
      setVisibleItems(newVisible);

      // --- POSIÇÃO DO TREM AMARRADA AO TRILHO ---
      const wrapRect   = trackWrapRef.current.getBoundingClientRect();
      const trackRect  = trackRef.current.getBoundingClientRect();
      const centerRect = trackCenterRef.current.getBoundingClientRect();

      const trainH = trainRef.current.offsetHeight || 0;

      // Centro X real do trilho (em px do wrapper)
      const centerXInWrap = centerRect.left - wrapRect.left;

      // Progresso ao longo do trilho baseado no CENTRO da viewport
      const trackTopGlobal = trackRect.top + window.scrollY;
      const centerOfViewport = window.scrollY + vh / 2;
      let p = (centerOfViewport - trackTopGlobal) / trackRect.height; // 0..1 ideal

      // Clamp para nunca sair do trilho
      p = Math.max(0, Math.min(1, p));

      // Movimento vertical útil = trilho - altura do trem
      const trackTopInWrap = trackRect.top - wrapRect.top;
      const usableH = Math.max(0, trackRect.height - trainH);
      const topInWrap = trackTopInWrap + usableH * p;

      setTrainPos({
        left: Math.round(centerXInWrap), // centro exato do trilho
        top:  Math.round(topInWrap),     // nunca passa do topo/fim do trilho
      });
    };

    const onScroll = () => update();
    const onResize = () => update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [timeline]);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Marcos do Transporte Ferroviário 2024</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acompanhe a jornada dos principais acontecimentos do setor ferroviário brasileiro
          </p>
        </div>

        {/* Container do Timeline Vertical */}
        <div ref={trackWrapRef} className="relative">
          {/* Trilho Central Vertical */}
          <div
            ref={trackRef}
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-6 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 rounded-full shadow-lg"
          >
            <div className="absolute top-0 left-1 w-1 h-full bg-gray-700 rounded-full shadow-inner"></div>
            <div className="absolute top-0 right-1 w-1 h-full bg-gray-700 rounded-full shadow-inner"></div>

            {/* Marcador invisível do centro (para pegar o rect já com transforms/bordas) */}
            <div ref={trackCenterRef} className="absolute left-1/2 top-0 w-px h-full pointer-events-none" />

            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gradient-to-r from-amber-800 to-amber-900 rounded shadow-sm"
                style={{ top: `${i}%` }}
              />
            ))}
          </div>

          {/* Trem posicionado pelo centro do trilho; wrapper interno centraliza */}
          <div
            ref={trainRef}
            className="absolute z-20 transition-[top,left] duration-150 ease-out"
            style={{ left: `${trainPos.left}px`, top: `${trainPos.top}px` }}
          >
            <div className="-translate-x-1/2">
              {/* Locomotiva */}
              <div className="relative w-20 h-32 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 rounded-t-xl rounded-b-lg shadow-2xl border-2 border-blue-900">
                <div className="absolute top-2 left-2 right-2 h-8 bg-gradient-to-b from-sky-200 to-sky-300 rounded border border-blue-300 shadow-inner"></div>
                <div className="absolute top-12 left-3 w-3 h-3 bg-yellow-300 rounded-full shadow-lg border border-yellow-400"></div>
                <div className="absolute top-12 right-3 w-3 h-3 bg-yellow-300 rounded-full shadow-lg border border-yellow-400"></div>
                <div className="absolute top-20 left-1 right-1 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-800">INFRA S.A.</span>
                </div>
                <div className="absolute top-16 left-0 w-1 h-8 bg-red-500 rounded-r"></div>
                <div className="absolute top-16 right-0 w-1 h-8 bg-red-500 rounded-l"></div>
                <div className="absolute -bottom-2 left-2 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div className="absolute -bottom-2 right-2 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-4 bg-gray-700 rounded-t-full"></div>
              </div>

              {/* Vagões */}
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="relative w-16 h-24 bg-gradient-to-b from-orange-500 to-orange-600 rounded-lg shadow-xl border border-orange-700 mt-1 mx-auto"
                >
                  <div className="absolute top-2 left-1 right-1 h-4 bg-white bg-opacity-90 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-800">INFRA</span>
                  </div>
                  <div className="absolute top-8 left-2 right-2 bottom-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded border border-orange-600"></div>
                  <div className="absolute -bottom-1.5 left-1 w-3 h-3 bg-gray-800 rounded-full border border-gray-600 shadow-lg">
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-1.5 right-1 w-3 h-3 bg-gray-800 rounded-full border border-gray-600 shadow-lg">
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Items - Cards Alternados */}
          <div className="space-y-4">
            {timeline.map((item, index) => {
              const isLeft = index % 2 === 0;
              const isVisible = visibleItems.has(index);

              return (
                <div key={index} className={`flex items-center min-h-[250px] ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <div
                    ref={cardRefs.current[index]}
                    className={`w-1/2 transition-all duration-700 ease-in-out ${
                      isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isLeft ? '-translate-x-10' : 'translate-x-10'}`
                    }`}
                  >
                    <div className={`relative ${isLeft ? 'pr-12' : 'pl-12'}`}>
                      {/* Linha conectora ao trilho */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r ${
                          isLeft ? 'right-0 w-12 from-blue-300 to-gray-400' : 'left-0 w-12 from-gray-400 to-blue-300'
                        }`}
                      />
                      {/* Ponto de conexão no card */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-400 shadow-lg ${
                          isLeft ? 'right-12' : 'left-12'
                        }`}
                      />
                      <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl shadow-lg border border-blue-200">
                                {item.icon}
                              </div>
                            </div>
                            <div className="flex-1 text-left">
                              <div className="inline-flex items-center mb-3">
                                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                  {item.month}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{item.title}</h3>
                              <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
