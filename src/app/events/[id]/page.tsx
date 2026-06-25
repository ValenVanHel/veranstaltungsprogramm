import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { EventRecord } from '@/lib/types';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // optional metadata
  return { title: `Event ${params.id}` };
}

export default async function EventPage({ params }: Props) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();
  if (error || !data) {
    return <p>Event nicht gefunden.</p>;
  }
  const event = data;
  return (
    <main className="event-page">
      <h1>{event.action_name}</h1>
      <p>Ort: {event.location_name}</p>
      <p>Start: {event.start_date}{event.start_time ? ' ' + event.start_time : ''}</p>
      {event.more_info && <p>{event.more_info}</p>}
    </main>
  );
}
