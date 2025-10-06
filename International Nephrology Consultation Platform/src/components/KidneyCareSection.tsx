import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

// Lightweight, no extra deps: native lazy-loading images
// Images are royalty-free educational stock (Unsplash) used for demo
const slides = [
  {
    title: 'Stay Hydrated',
    tip: 'Aim for 6–8 glasses of water daily unless your doctor advises otherwise.',
    image:
      'https://images.unsplash.com/photo-1516274626895-055a99214f08?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Limit Salt',
    tip: 'Reduce sodium to help control blood pressure and protect kidney function.',
    image:
      'https://images.unsplash.com/photo-1546549039-49f4d550481d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Check Blood Pressure',
    tip: 'Keep BP in target range; high BP is a major risk for kidney damage.',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Manage Diabetes',
    tip: 'Maintain A1c goals to reduce the risk of diabetic nephropathy.',
    image:
      'https://images.unsplash.com/photo-1582719478250-73fdd1f7b1a4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Choose Kidney-Friendly Diet',
    tip: 'Focus on fruits, veggies, lean proteins; limit processed foods.',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Avoid NSAID Overuse',
    tip: 'Frequent painkiller use may harm kidneys—consult your doctor.',
    image:
      'https://images.unsplash.com/photo-1580281657527-47f249e8f2a0?q=80&w=1200&auto=format&fit=crop',
  },
];

export function KidneyCareSection() {
  return (
    <section id="kidney-care" className="py-20 bg-white">
      <div className="container-medical">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Kidney Care</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kidney Care Knowledge Hub</h2>
            <p className="text-gray-600">Quick, practical tips to protect and improve kidney health.</p>
          </div>

          <Carousel className="relative">
            <CarouselContent className="-ml-2">
              {slides.map((s, i) => (
                <CarouselItem key={i} className="pl-2 md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden group border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <p className="text-sm text-gray-600">{s.tip}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-6 bg-white/90 backdrop-blur border" />
            <CarouselNext className="-right-6 bg-white/90 backdrop-blur border" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default KidneyCareSection;
