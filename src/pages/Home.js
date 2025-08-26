import React, { useEffect, useRef, useState } from 'react';
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { ArrowRight, Download, TrendingUp, Users, Train, BarChart3, Eye, Calendar, MapPin } from 'lucide-react';

// Componentes
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import TimelineSection from '../components/sections/TimelineSection';
import InvestmentChart from '../components/charts/InvestmentChart';
import CargoMovementChart from '../components/charts/CargoMovementChart';
import ContainerChart from '../components/charts/ContainerChart';
import AccidentChart from '../components/charts/AccidentChart';

// Dados reais da publicação
const railwayData = {
  title: "Diagnóstico Logístico Ferroviário",
  subtitle: "Principais marcos do transporte ferroviário em 2024",
  year: "2024",
  
  // Estatísticas principais
  stats: [
    { 
      label: "Investimento Público", 
      value: 265.85, 
      suffix: "M", 
      prefix: "R$",
      description: "Aumento de 76,8% em relação a 2023",
      color: "text-blue-600"
    },
    { 
      label: "Extensão da Malha", 
      value: 30618, 
      suffix: "km",
      description: "Gerenciada por 13 concessionárias",
      color: "text-green-600"
    },
    { 
      label: "Movimentação de Cargas", 
      value: 541, 
      suffix: "M TU",
      description: "Maior índice desde 2018",
      color: "text-purple-600"
    },
    { 
      label: "Frota Ferroviária", 
      value: 102.6, 
      suffix: "K vagões",
      description: "Crescimento de 4.311 unidades",
      color: "text-orange-600"
    }
  ],

  // Marcos mensais do transporte ferroviário
  timeline: [
    {
      month: "Janeiro",
      title: "Nova metodologia de custos de capital no setor ferroviário",
      description: "A Resolução ANTT nº 6.035 aprovou a metodologia de estimativa do custo médio ponderado de capital para o setor ferroviário.",
      icon: "📊"
    },
    {
      month: "Fevereiro", 
      title: "Segurança nas concessões ferroviárias é reforçada",
      description: "ANTT revisou diretrizes para contratação e manutenção de seguros nas concessões ferroviárias.",
      icon: "🛡️"
    },
    {
      month: "Março",
      title: "Brasil adere a projeto de construção de ferrovia bioceânica",
      description: "Brasil aderiu oficialmente ao projeto da Ferrovia Bioceânica, ligando Atlântico ao Pacífico.",
      icon: "🌎"
    },
    {
      month: "Abril",
      title: "Eldorado Brasil Celulose S.A. avança com desapropriações",
      description: "Autorização para ampliar malha ferroviária conectando Malha Oeste à Malha Norte.",
      icon: "🌲"
    },
    {
      month: "Maio",
      title: "Brasil institui o Planejamento Integrado de Transportes",
      description: "Decreto nº 12.022 institui o PIT para estruturar a logística nacional integrando todos os modais.",
      icon: "🚛"
    },
    {
      month: "Junho",
      title: "Novas diretrizes para prorrogação de concessões",
      description: "Governo Federal publicou regras mais rígidas para renovações antecipadas dos contratos.",
      icon: "📋"
    },
    {
      month: "Julho",
      title: "Nova frota de locomotivas reforça logística do Centro-Sudeste",
      description: "Entregue lote de 12 locomotivas à FCA com investimento de R$ 300 milhões.",
      icon: "🚂"
    },
    {
      month: "Agosto",
      title: "Evento 'Brasil nos Trilhos' reúne setor ferroviário",
      description: "VIII edição realizada em Brasília para debater sustentabilidade e inovação.",
      icon: "🤝"
    },
    {
      month: "Setembro",
      title: "Projeto Trem Intercidades recebe qualificação oficial",
      description: "TIC Eixo Norte qualificado no PPI para conectar São Paulo, Jundiaí e Campinas.",
      icon: "🚆"
    },
    {
      month: "Outubro",
      title: "Governo anuncia plano para revitalizar 11 mil km",
      description: "Plano para recuperar trilhos ociosos com até R$ 20 bilhões em indenizações.",
      icon: "🔧"
    },
    {
      month: "Novembro",
      title: "Planejamento de obras de reconstrução na Malha Sul",
      description: "Início do planejamento para reconstrução da Malha Sul após as enchentes.",
      icon: "🏗️"
    },
    {
      month: "Dezembro",
      title: "Novas regras para exploração indireta de ferrovias",
      description: "Resolução nº 6.058 cria novo processo de chamamento público.",
      icon: "💼"
    }
  ]
};

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection data={railwayData} />
      
      <StatsSection stats={railwayData.stats} />
      
      <TimelineSection timeline={railwayData.timeline} />
      
      {/* Seção de Investimentos */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Evolução dos Investimentos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Análise da evolução dos investimentos públicos no setor ferroviário brasileiro
            </p>
          </div>
          <InvestmentChart />
        </div>
      </section>

      {/* Seção de Movimentação de Cargas */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Movimentação de Cargas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transporte de 541 milhões de TU em 2024 - maior índice desde 2018
            </p>
          </div>
          <CargoMovementChart />
        </div>
      </section>

      {/* Seção de Contêineres */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Transporte de Contêineres</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Crescimento sustentado na movimentação ferroviária de contêineres
            </p>
          </div>
          <ContainerChart />
        </div>
      </section>

      {/* Seção de Acidentes */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <AccidentChart />
        </div>
      </section>

      {/* Seção Infraestrutura */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Infraestrutura Ferroviária</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mapa da malha ferroviária em operação no Brasil
            </p>
          </div>

          <div className="flex justify-center mb-16">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/apps/b27fa55b-f73c-4d7a-8f55-6b83f3e1a89c/bc555421c_DiagnsticoLogstico-Ferrovirio_R01-5.png" 
              alt="Mapa da Infraestrutura Ferroviária no Brasil"
              className="rounded-lg shadow-xl max-w-full h-auto border-4 border-white"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Principais Concessionárias */}
            {[
              { name: "Ferrovia Centro-Atlântica S.A. (FCA)", km: "7.856,8 km" },
              { name: "Rumo Malha Sul (RMS)", km: "7.223,4 km" },
              { name: "Ferrovia Transnordestina Logística (FTL)", km: "4.295,1 km" },
              { name: "Rumo Malha Paulista (RMP)", km: "2.118 km" },
              { name: "Rumo Malha Oeste (RMO)", km: "1.973,1 km" },
              { name: "MRS Logística S.A. (MRS)", km: "1.832,3 km" }
            ].map((railway, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Train className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-sm font-semibold">
                      {railway.name.split('(')[0]}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{railway.km}</div>
                  <p className="text-sm text-gray-600">Extensão operacional</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estatística importante sobre trilhos sem tráfego */}
          <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Desafio: Trilhos Ociosos</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-red-600 mb-2">10.642 km</div>
                  <p className="text-gray-600">de trilhos listados como "sem tráfego"</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">1/3</div>
                  <p className="text-gray-600">da malha ferroviária nacional ociosa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Acesse o Diagnóstico Completo
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Baixe o documento completo e tenha acesso a todos os dados, análises detalhadas e 
            insights estratégicos sobre o setor ferroviário brasileiro.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg group">
            <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Download do Diagnóstico
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Train className="w-6 h-6" />
                INFRA S.A.
              </h3>
              <p className="text-gray-400 mb-4">
                Observatório Nacional de Transporte e Logística
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                Brasília, DF - Brasil
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Diagnósticos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Relatórios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dados Abertos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Metodologia</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fale Conosco</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parcerias</a></li>
                <li><a href="https://www.infrasa.gov.br" className="hover:text-white transition-colors">Site Oficial</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 INFRA S.A. - Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
