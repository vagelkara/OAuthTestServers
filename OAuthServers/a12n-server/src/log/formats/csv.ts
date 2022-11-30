import { eventTypeString, LogEntry } from '../types';
import { stringify } from 'csv-stringify/sync';

export default function csv(log: LogEntry[]): string {

  return stringify(log, {
    header: true,
    columns: {
      time: 'time',
      eventType: 'eventType',
      ip: 'ip',
      userAgent: 'userAgent',
      country: 'country',
    },
    cast: {
      date: (value) => value.toISOString(),
      number: (value) => eventTypeString.get(value)!,
    }
  });

}
