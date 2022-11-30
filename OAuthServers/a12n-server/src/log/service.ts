import { Context } from '@curveball/core';
import db from '../database';
import { Principal } from '../principal/types';
import { EventType, LogEntry } from './types';
import * as geoip from 'geoip-lite';
import { UserLog as UserLogRecord } from 'knex/types/tables';

export function log(eventType: EventType, ctx: Context): Promise<void>;
export function log(eventType: EventType, ip: string|null, userId: number, userAgent: string|null): Promise<void>;
export default async function log(
  eventType: EventType,
  arg1: string | Context | null,
  arg2?: number,
  arg3?: string|null
) {

  if (isContext(arg1)) {
    await addLogEntry(
      eventType,
      arg1.ip() ?? '',
      arg1.session.user?.id ?? null,
      arg1.request.headers.get('User-Agent'),
    );
  } else {
    await addLogEntry(eventType, arg1 ?? '', arg2!, arg3 ?? '');
  }

}

export async function addLogEntry(eventType: EventType, ip: string, userId: number, userAgent: string|null): Promise<void> {

  await db('user_log').insert({
    user_id: userId,
    time: Math.floor(Date.now() / 1000),
    event_type: eventType,
    ip: ip,
    user_agent: userAgent,
    country: ip ? getCountryByIp(ip) : null,
  });

}

export async function findByUser(user: Principal): Promise<LogEntry[]> {

  const result = await db('user_log')
    .select('*')
    .where({user_id: user.id});
  return result.map( (row: UserLogRecord) => {
    return {
      time: new Date(row.time * 1000),
      ip: row.ip,
      eventType: row.event_type,
      userAgent: row.user_agent,
      country: row.country
    };
  });

}

function isContext(ctx: any): ctx is Context {

  return (ctx as Context).ip !== undefined;

}

function getCountryByIp(ip: string): string|null {

  return geoip.lookup(ip)?.country || null;

}
