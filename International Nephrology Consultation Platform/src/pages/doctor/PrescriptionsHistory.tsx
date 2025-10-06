import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { FileText, Download, Eye, Calendar, Pill, Search, User, Clock } from 'lucide-react';

export function PrescriptionsHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/appointments', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load prescriptions');
        const data = await res.json().catch(() => ({}));
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = useMemo(() => {
    const list = appointments
      .filter((a) => a?.prescription && (a.prescription.notes || (Array.isArray(a.prescription.medicines) && a.prescription.medicines.length)))
      .map((a) => ({
        id: a._id,
        date: a.date,
        time: a.timeSlot,
        patientName: a?.patient?.name || 'Patient',
        patientEmail: a?.patient?.email || '',
        type: a?.type || 'Consultation',
        notes: a?.prescription?.notes || '',
        medicines: Array.isArray(a?.prescription?.medicines) ? a.prescription.medicines : [],
      }));

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((it) =>
      it.patientName.toLowerCase().includes(q) ||
      it.notes.toLowerCase().includes(q) ||
      it.medicines.some((m: any) => String(m.name).toLowerCase().includes(q))
    );
  }, [appointments, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground">Review and manage prescriptions you've issued</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, medicine, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prescription History
          </CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${items.length} prescriptions found`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="text-muted-foreground">Loading prescriptions...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">No prescriptions yet</div>
          )}
          {!loading && !error && items.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {p.patientName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.patientName}</h3>
                      <Badge variant="secondary">{p.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{p.date}</span>
                      {p.time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{p.time}</span>}
                    </div>
                    {p.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{p.notes}</p>
                    )}
                    {p.medicines.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Pill className="h-4 w-4" />Medicines</div>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {p.medicines.map((m: any, idx: number) => (
                            <li key={idx}>
                              {m.link ? (
                                <a className="text-primary hover:underline" href={m.link} target="_blank" rel="noreferrer">
                                  {m.name}{m.dosage ? ` — ${m.dosage}` : ''}{m.frequency ? ` — ${m.frequency}` : ''}
                                </a>
                              ) : (
                                <span>
                                  {m.name}{m.dosage ? ` — ${m.dosage}` : ''}{m.frequency ? ` — ${m.frequency}` : ''}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/doctor/appointments/${p.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
