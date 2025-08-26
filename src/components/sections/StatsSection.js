import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "components/ui/card";

export default function StatsSection({ stats }) {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const finalValue = stat.value;
      const increment = finalValue / 50;
      let currentValue = 0;
      
      return setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          currentValue = finalValue;
          clearInterval(timers[index]);
        }
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = currentValue;
          return newValues;
        });
      }, 20);
    });

    return () => timers.forEach(timer => clearInterval(timer));
  }, [stats]);

  const formatValue = (value, stat) => {
    const numValue = Math.floor(value);
    const prefix = stat.prefix || '';
    
    let suffixText = stat.suffix || '';
    if (suffixText === 'M') suffixText = 'milhões';
    if (suffixText === 'K') suffixText = 'mil';
    if (suffixText === 'M TU') suffixText = 'M de TU';
    if (suffixText === 'K vagões') suffixText = 'mil vagões';

    const formattedNumber = numValue.toLocaleString('pt-BR');

    return { number: `${prefix}${formattedNumber}`, unit: suffixText };
  };

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const { number, unit } = formatValue(animatedValues[index], stat);
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 group-hover:shadow-lg transition-all duration-300">
                    <div className={`flex items-baseline justify-center whitespace-nowrap ${stat.color} mb-2`}>
                      <span className="text-3xl md:text-4xl font-bold">{number}</span>
                      {unit && <span className="text-xl font-semibold ml-2">{unit}</span>}
                    </div>
                    <p className="text-gray-900 font-semibold mb-2 h-12 flex items-center justify-center">{stat.label}</p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}