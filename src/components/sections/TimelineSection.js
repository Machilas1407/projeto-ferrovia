import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "components/ui/card";

export default function TimelineSection({ timeline }) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [trainPos, setTrainPos] = useState({ left: 0, top: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const trackWrapRef = useRef(null);
  const trackRef = useRef(null);
  const trackCenterRef = useRef(null);
  const trainRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    cardRefs.current = timeline.map(() => React.createRef());

    const update = () => {
      if (!sectionRef.current || !trackWrapRef.current || !trackRef.current || !trainRef.current || !trackCenterRef.current) return;

      // --- visibilidade progressiva (mantém lógica) ---
      const sec = sectionRef.current.getBoundingClientRect();
      const secTop = sec.top + window.scrollY;
      const secH = sec.height;
      const vh = window.innerHeight;
      const secP = Math.max(0, Math.min(1, (window.scrollY - (secTop - vh + 200)) / ((secTop + secH - 200) - (secTop - vh + 200))));
      const newVisible = new Set();
      const itemsToShow = Math.floor(secP * timeline.length * 1.2);
      for (let i = 0; i < Math.min(itemsToShow, timeline.length); i++) newVisible.add(i);
      setVisibleItems(newVisible);

      // --- posição do trem presa ao trilho ---
      const wrapRect   = trackWrapRef.current.getBoundingClientRect();
      const trackRect  = trackRef.current.getBoundingClientRect();
      const centerRect = trackCenterRef.current.getBoundingClientRect();

      const trainH = trainRef.current.offsetHeight || 0;

      const trackTopGlobal = trackRect.top + window.scrollY;
      const centerOfViewport = window.scrollY + vh / 2;
      let p = (centerOfViewport - trackTopGlobal) / trackRect.height;
      p = Math.max(0, Math.min(1, p));

const trackTopInWrap = trackRect.top - wrapRect.top;
const usableH = Math.max(0, trackRect.height - trainH);

// offset só no mobile (ajuste o valor ao seu gosto)
const MOBILE_TRAIN_OFFSET_Y = 180; // px
const extraY = isMobile ? MOBILE_TRAIN_OFFSET_Y : 0;

let topInWrap = trackTopInWrap + usableH * p + extraY;

// mantém o clamp para não sair do trilho
const minTop = trackTopInWrap;
const maxTop = trackTopInWrap + usableH;
topInWrap = Math.max(minTop, Math.min(maxTop, topInWrap));


      if (isMobile) {
        // no mobile, não ajustamos o left em px — ele fica cravado no 50% via style
        setTrainPos(prev => ({ left: prev.left, top: Math.round(topInWrap) }));
      } else {
        // desktop mantém cálculo preciso do centro do trilho
        const centerXInWrap = centerRect.left - wrapRect.left;
        setTrainPos({
          left: Math.round(centerXInWrap),
          top:  Math.round(topInWrap),
        });
      }
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
  }, [timeline, isMobile]); // << importante

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Marcos do Transporte Ferroviário 2024</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acompanhe a jornada dos principais acontecimentos do setor ferroviário brasileiro
          </p>
        </div>

        {/* Timeline + Trilho */}
        <div ref={trackWrapRef} className="relative">

          {/* Trilho central */}
          <div
            ref={trackRef}
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-6 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 rounded-full shadow-lg z-10"
          >
            <div className="absolute top-0 left-1 w-1 h-full bg-gray-700 rounded-full shadow-inner"></div>
            <div className="absolute top-0 right-1 w-1 h-full bg-gray-700 rounded-full shadow-inner"></div>
            <div ref={trackCenterRef} className="absolute left-1/2 top-0 w-px h-full pointer-events-none" />
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gradient-to-r from-amber-800 to-amber-900 rounded shadow-sm"
                style={{ top: `${i}%` }}
              />
            ))}
          </div>

          {/* Trem - z-index muda: atrás dos cards no mobile, acima no desktop */}
          <div
            ref={trainRef}
            className={`${isMobile ? 'z-10' : 'z-20'} absolute transition-[top,left] duration-150 ease-out will-change-transform [transform:translate3d(0,0,0)]`}
            style={{
              left: isMobile ? '50%' : `${trainPos.left}px`, // << mobile cravado no centro
              top: `${trainPos.top}px`,
            }}
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

          {/* ITEMS */}
          <div className={`${isMobile ? 'space-y-0' : 'space-y-4'} relative ${isMobile ? 'z-20' : ''}`}>
            {timeline.map((item, index) => {
              const isLeft = index % 2 === 0;
              const isVisible = visibleItems.has(index);

              if (isMobile) {
                // Mobile: card centralizado, um por "tela"
                return (
                  <div key={index} className="min-h-[80vh] flex items-center justify-center">
                    <div
                      ref={cardRefs.current[index]}
                      className={`w-[90%] max-w-md transition-all duration-500 ease-out
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                      {/* conector opcional no mobile (curto) */}
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-0.5 h-7 bg-gradient-to-b from-blue-300 to-gray-400" />
                        <Card className="shadow-xl border-0 bg-white/85 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl shadow border border-blue-200">
                                  {item.icon}
                                </div>
                              </div>
                              <div className="flex-1 text-left">
                                <div className="inline-flex items-center mb-3">
                                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                                    {item.month}
                                  </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                                <p className="text-gray-700 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              }

              // Desktop (como estava): cards alternados, trilho no meio, trem por cima
              return (
                <div key={index} className={`flex items-center min-h-[250px] ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <div
                    ref={cardRefs.current[index]}
                    className={`w-1/2 transition-all duration-700 ease-in-out ${
                      isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isLeft ? '-translate-x-10' : 'translate-x-10'}`
                    }`}
                  >
                    <div className={`relative ${isLeft ? 'pr-12' : 'pl-12'}`}>
                      {/* conector ao trilho */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r ${
                          isLeft ? 'right-0 w-12 from-blue-300 to-gray-400' : 'left-0 w-12 from-gray-400 to-blue-300'
                        }`}
                      />
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
