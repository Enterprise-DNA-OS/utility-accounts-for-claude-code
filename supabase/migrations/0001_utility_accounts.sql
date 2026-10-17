-- Private operator database. No extensions, browser API or supply-control operations.
create table accounts (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
name text not null check (btrim(name) <> ''), owner text not null, contact_email text, reviewed_on date, retention_review_on date not null, archived boolean not null default false, check (reviewed_on <= current_date));
create table service_points (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
account_id uuid not null references accounts(id), name text not null, identifier text not null unique, address text not null, commodity text not null check (commodity in ('electricity','gas','water')), region text not null, status text not null default 'active' check (status in ('active','closed')));
create table agreements (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
point_id uuid not null references service_points(id), name text not null, start_on date not null, end_on date not null, notice_days integer not null default 30 check(notice_days between 0 and 365), annual_kwh numeric(16,3) check(annual_kwh >= 0), status text not null default 'active' check(status in ('active','superseded','closed')), check(end_on >= start_on));
create table meters (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
point_id uuid not null references service_points(id), name text not null, serial text not null unique, unit text not null check(unit in ('kWh','m3')), daily_limit numeric(16,3) not null check(daily_limit > 0), active boolean not null default true);
create table readings (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
meter_id uuid not null references meters(id), read_on date not null check(read_on <= current_date), value numeric(18,3) not null check(value >= 0), kind text not null check(kind in ('actual','estimated')), evidence text not null check(btrim(evidence) <> ''), unique(meter_id,read_on));
create table cases (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
point_id uuid not null references service_points(id), name text not null, category text not null check(category in ('billing-query','meter-query','complaint','account-query')), owner text not null, opened_on date not null check(opened_on <= current_date), due_on date not null, status text not null default 'open' check(status in ('open','waiting','closed')), disputed_amount numeric(14,2) not null default 0 check(disputed_amount >= 0), currency text not null default 'NZD' check(currency in ('NZD','AUD','USD')), resolution text, closed_on date, check(due_on >= opened_on), check((status='closed' and coalesce(length(btrim(resolution)),0)>0 and closed_on is not null and closed_on between opened_on and current_date) or (status <> 'closed' and closed_on is null)));
create table moves (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
point_id uuid not null references service_points(id), name text not null, move_on date not null, direction text not null check(direction in ('move-in','move-out')), status text not null default 'pending' check(status in ('pending','confirmed','cancelled')), confirmation text, check(status <> 'confirmed' or coalesce(length(btrim(confirmation)),0) > 0));
create table notes (id uuid primary key default gen_random_uuid(), source_id text unique not null check (btrim(source_id) <> ''), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
account_id uuid not null references accounts(id), body text not null check(btrim(body) <> ''), author text not null check(btrim(author) <> ''));

create table audit_log (id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, action text not null, actor text not null, before_row jsonb, after_row jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create function touch_utility_row() returns trigger language plpgsql as $$ begin new.updated_at=clock_timestamp(); return new; end $$;
create function audit_utility_row() returns trigger language plpgsql as $$
begin
 insert into audit_log(entity,record_id,action,actor,before_row,after_row)
 values(TG_TABLE_NAME,coalesce(new.id,old.id),TG_OP,coalesce(nullif(current_setting('utility.actor',true),''),current_user),case when TG_OP='INSERT' then null else to_jsonb(old) end,case when TG_OP='DELETE' then null else to_jsonb(new) end);
 return coalesce(new,old);
end $$;
create function guard_reading() returns trigger language plpgsql as $$
begin
 perform 1 from meters where id=new.meter_id for update;
 if exists(select 1 from readings where meter_id=new.meter_id and id<>new.id and ((read_on<new.read_on and value>new.value) or (read_on>new.read_on and value<new.value))) then
 raise exception 'Cumulative reading reverses history; record a replacement meter separately'; end if;
 return new;
end $$;
create trigger guard_reading before insert or update on readings for each row execute function guard_reading();
create function guard_agreement() returns trigger language plpgsql as $$
begin
 perform 1 from service_points where id=new.point_id for update;
 if new.status='active' and exists(select 1 from agreements where point_id=new.point_id and id<>new.id and status='active' and start_on<=new.end_on and end_on>=new.start_on) then
 raise exception 'Active agreement dates overlap at this service point'; end if;
 return new;
end $$;
create trigger guard_agreement before insert or update on agreements for each row execute function guard_agreement();
alter table accounts enable row level security;
revoke all on accounts from public;
create trigger touch before update on accounts for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on accounts for each row execute function audit_utility_row();
alter table service_points enable row level security;
revoke all on service_points from public;
create trigger touch before update on service_points for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on service_points for each row execute function audit_utility_row();
alter table agreements enable row level security;
revoke all on agreements from public;
create trigger touch before update on agreements for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on agreements for each row execute function audit_utility_row();
alter table meters enable row level security;
revoke all on meters from public;
create trigger touch before update on meters for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on meters for each row execute function audit_utility_row();
alter table readings enable row level security;
revoke all on readings from public;
create trigger touch before update on readings for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on readings for each row execute function audit_utility_row();
alter table cases enable row level security;
revoke all on cases from public;
create trigger touch before update on cases for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on cases for each row execute function audit_utility_row();
alter table moves enable row level security;
revoke all on moves from public;
create trigger touch before update on moves for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on moves for each row execute function audit_utility_row();
alter table notes enable row level security;
revoke all on notes from public;
create trigger touch before update on notes for each row execute function touch_utility_row();
create trigger audit after insert or update or delete on notes for each row execute function audit_utility_row();
alter table audit_log enable row level security;
revoke all on audit_log from public;
create index service_points_account_id_idx on service_points(account_id);
create index agreements_point_id_idx on agreements(point_id);
create index meters_point_id_idx on meters(point_id);
create index readings_meter_id_idx on readings(meter_id);
create index cases_point_id_idx on cases(point_id);
create index moves_point_id_idx on moves(point_id);
create index notes_account_id_idx on notes(account_id);
create index audit_log_record_id_idx on audit_log(record_id);

create index open_cases_due_idx on cases(due_on) where status <> 'closed';
create index pending_moves_idx on moves(move_on) where status='pending';
create index agreement_end_idx on agreements(end_on) where status='active';
create view v_renewals with (security_invoker=true) as
 select g.id,g.source_id,g.name as agreement,a.name as account,p.name as site,p.identifier,g.start_on,g.end_on,g.end_on-g.notice_days as notice_on,g.end_on-current_date as days_left,g.annual_kwh,a.owner
 from agreements g join service_points p on p.id=g.point_id join accounts a on a.id=p.account_id where g.status='active' and p.status='active';
create view v_usage with (security_invoker=true) as
 select q.*,value-previous_value as consumption,
 round((value-previous_value)/nullif(read_on-previous_on,0),3) as per_day
 from (select r.id,r.source_id,m.id as meter_id,m.name as meter,m.unit,m.daily_limit,p.name as site,p.id as point_id,a.name as account,r.read_on,r.kind,r.value,
 lag(r.value) over(partition by r.meter_id order by r.read_on) as previous_value,
 lag(r.read_on) over(partition by r.meter_id order by r.read_on) as previous_on
 from readings r join meters m on m.id=r.meter_id join service_points p on p.id=m.point_id join accounts a on a.id=p.account_id) q;
create view v_reading_exceptions with (security_invoker=true) as
 select m.id,m.source_id,m.name as meter,p.name as site,a.name as account,m.unit,
 r.read_on,r.kind,u.per_day,m.daily_limit,
 case when r.id is null then 'No reading' when current_date-r.read_on>35 then 'Reading older than 35 days' when r.kind='estimated' then 'Latest reading estimated' when u.per_day>m.daily_limit then 'Daily usage exceeds site limit' end as issue
 from meters m join service_points p on p.id=m.point_id join accounts a on a.id=p.account_id
 left join lateral(select * from readings where meter_id=m.id order by read_on desc limit 1) r on true
 left join v_usage u on u.id=r.id
 where m.active and p.status='active' and (r.id is null or current_date-r.read_on>35 or r.kind='estimated' or u.per_day>m.daily_limit);
create view v_case_queue with (security_invoker=true) as
 select c.id,c.source_id,c.name as subject,a.name as account,p.name as site,c.category,c.owner,c.status,c.opened_on,c.due_on,current_date-c.due_on as days_overdue,c.disputed_amount,c.currency
 from cases c join service_points p on p.id=c.point_id join accounts a on a.id=p.account_id where c.status<>'closed';
create view v_move_queue with (security_invoker=true) as
 select m.id,m.source_id,m.name as request,a.name as account,p.name as site,m.direction,m.move_on,m.move_on-current_date as days_until,m.status
 from moves m join service_points p on p.id=m.point_id join accounts a on a.id=p.account_id where m.status='pending';
create view v_attention with (security_invoker=true) as
 select 'renewal'::text as kind,source_id as reference,account,site,'Notice date reached'::text as issue,notice_on as due_on from v_renewals where notice_on<=current_date
 union all select 'reading',source_id,account,site,issue,read_on from v_reading_exceptions
 union all select 'case',source_id,account,site,'Response overdue',due_on from v_case_queue where days_overdue>0
 union all select 'move',source_id,account,site,'Move needs confirmation',move_on from v_move_queue where days_until<=7
 union all select 'agreement',p.source_id,a.name,p.name,'No agreement covers today',current_date from service_points p join accounts a on a.id=p.account_id
 where p.status='active' and not exists(select 1 from agreements g where g.point_id=p.id and g.status='active' and current_date between g.start_on and g.end_on);
create view v_compliance with (security_invoker=true) as
 select 'ACC-01'::text as rule,source_id as reference,name as account,'Review contact accuracy'::text as finding,'https://www.privacy.org.nz/privacy-principles/8/'::text as source
 from accounts where not archived and (reviewed_on is null or current_date-reviewed_on>365 or coalesce(contact_email,'')='')
 union all select 'RET-01',source_id,name,'Retention review due, human review required','https://www.privacy.org.nz/privacy-principles/9/' from accounts where retention_review_on<current_date
 union all select 'OPS-01',source_id,account,'Response date missed, internal service promise','docs/compliance.md#operator-policies' from v_case_queue where days_overdue>0
 union all select 'OPS-02',source_id,account,issue,'docs/compliance.md#operator-policies' from v_reading_exceptions;
revoke all on v_renewals,v_usage,v_reading_exceptions,v_case_queue,v_move_queue,v_attention,v_compliance from public;
-- Supabase default grants must not expose operator records through the Data API.
do $$ declare r text; t text; begin
 foreach r in array array['anon','authenticated'] loop
 if exists(select 1 from pg_roles where rolname=r) then
 foreach t in array array['accounts','service_points','agreements','meters','readings','cases','moves','notes','audit_log','schema_migrations','v_renewals','v_usage','v_reading_exceptions','v_case_queue','v_move_queue','v_attention','v_compliance'] loop
 execute format('revoke all on %I from %I',t,r); end loop;
 end if; end loop; end $$;
