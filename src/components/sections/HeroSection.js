import React from 'react';
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Download, Eye, Calendar } from 'lucide-react';

export default function HeroSection({ data }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-60"></div>
      
      {/* Railway Track Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 opacity-20"></div>
      <div className="absolute bottom-1 left-0 right-0 h-px bg-gray-300"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <Badge variant="outline" className="mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm border-blue-200">
          <Calendar className="w-4 h-4 mr-2" />
          Publicação {data.year}
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {data.title.split(' ').slice(0, 2).join(' ')}
          <span className="text-blue-600 block mt-2">
            {data.title.split(' ').slice(2).join(' ')}
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {data.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg group">
            <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Baixar Diagnóstico Completo
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-4 text-lg group border-blue-200 hover:border-blue-300">
            <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Visualizar Online
          </Button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 animate-bounce opacity-20">
          <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
        </div>
        <div className="absolute bottom-10 left-10 animate-pulse opacity-30">
          <div className="w-8 h-8 bg-indigo-200 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}