import React from 'react';
import { Card, CardContent } from './ui/card';
import { Calendar, FileText, Video, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      desc: 'Choose consultation type, date and time that suits you.',
    },
    {
      icon: FileText,
      title: 'Share Details',
      desc: 'Fill basic info and upload reports for better assessment.',
    },
    {
      icon: Video,
      title: 'Consult Online',
      desc: 'Join the secure video session with the nephrologist.',
    },
    {
      icon: CheckCircle2,
      title: 'Get Plan & Follow-up',
      desc: 'Receive prescription and follow-up guidance.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#006f6f]/5">
      <div className="container-medical">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-600">Simple, guided steps to get expert kidney care online.</p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <Card key={s.title} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-left">
                <div className="w-12 h-12 rounded-lg bg-[#006f6f]/10 text-[#006f6f] flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
