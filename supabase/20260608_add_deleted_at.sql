alter table if exists public.leads
  add column if not exists deletedAt bigint default 0;
alter table if exists public.leads
  add column if not exists isDeleted boolean default false;

alter table if exists public.clients
  add column if not exists deletedAt bigint default 0;
alter table if exists public.clients
  add column if not exists isDeleted boolean default false;

alter table if exists public.financials
  add column if not exists deletedAt bigint default 0;
alter table if exists public.financials
  add column if not exists isDeleted boolean default false;

alter table if exists public.receipts
  add column if not exists deletedAt bigint default 0;
alter table if exists public.receipts
  add column if not exists isDeleted boolean default false;

alter table if exists public.gamification
  add column if not exists isDeleted boolean default false;
