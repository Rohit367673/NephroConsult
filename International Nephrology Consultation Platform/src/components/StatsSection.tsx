import React from 'react';
import { Card, CardContent } from './ui/card';
import { Heart, Globe, Star, Calendar } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { icon: Heart, label: 'Patients Treated', value: '5,000+' },
    { icon: Calendar, label: 'Years Experience', value: '15+' },
    { icon: Globe, label: 'Countries Served', value: '20+' },
    { icon: Star, label: 'Avg. Rating', value: '4.9/5' },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container-medical">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-gray-200">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#006f6f]/10 text-[#006f6f] flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-600">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
