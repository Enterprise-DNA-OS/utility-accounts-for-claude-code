import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {REPO_ROOT} from './db.mjs';
import {table} from './format.mjs';
export const entities={
 accounts:{label:'name',fields:['source_id','name','owner','contact_email','reviewed_on','retention_review_on','archived']},
 service_points:{label:'name',fields:['source_id','account_id','name','identifier','address','commodity','region','status'],refs:{account_id:'accounts'}},
 agreements:{label:'name',fields:['source_id','point_id','name','start_on','end_on','notice_days','annual_kwh','status'],refs:{point_id:'service_points'}},
 meters:{label:'name',fields:['source_id','point_id','name','serial','unit','daily_limit','active'],refs:{point_id:'service_points'}},
 readings:{label:'source_id',fields:['source_id','meter_id','read_on','value','kind','evidence'],refs:{meter_id:'meters'}},
 cases:{label:'name',fields:['source_id','point_id','name','category','owner','opened_on','due_on','status','disputed_amount','currency','resolution','closed_on'],refs:{point_id:'service_points'}},
 moves:{label:'name',fields:['source_id','point_id','name','move_on','direction','status','confirmation'],refs:{point_id:'service_points'}},
 notes:{label:'source_id',fields:['source_id','account_id','body','author'],refs:{account_id:'accounts'}}
};
export const reads={
 accounts:'select source_id,name,owner,contact_email,reviewed_on,retention_review_on from accounts order by name',
 'service-points':'select p.source_id,p.name,a.name as account,p.identifier,p.commodity,p.status from service_points p join accounts a on a.id=p.account_id order by p.name',
 agreements:'select * from v_renewals order by end_on,source_id',
 'renewals-due':'select agreement,account,site,notice_on,end_on,days_left from v_renewals where notice_on<=current_date+60 order by notice_on,source_id',
 'meter-reads':'select meter,site,unit,read_on,kind,value,consumption,per_day from v_usage order by meter,read_on',
 'reading-exceptions':'select meter,site,unit,read_on,per_day,issue from v_reading_exceptions order by meter',
 'case-queue':'select source_id,subject,account,owner,status,due_on,days_overdue from v_case_queue order by due_on,source_id',
 'move-desk':'select source_id,request,account,site,direction,move_on,days_until from v_move_queue order by move_on,source_id',
 attention:'select * from v_attention order by kind,reference',
 compliance:'select * from v_compliance order by rule,reference',
 history:'select entity,record_id,action,actor,created_at from audit_log order by created_at desc,id limit 100'
};
export const questions=[
 ['Which expiring agreements also have unresolved service cases?',`select r.account,r.site,r.end_on,count(c.id)::int as open_cases from v_renewals r join agreements g on g.id=r.id join cases c on c.point_id=g.point_id and c.status<>'closed' where r.days_left<=60 group by r.account,r.site,r.end_on order by r.end_on`],
 ['Which sites combine estimated readings with billing questions?',`select distinct e.account,e.site,e.read_on from v_reading_exceptions e join meters m on m.id=e.id join cases c on c.point_id=m.point_id where e.kind='estimated' and c.status<>'closed' and c.category in ('billing-query','meter-query') order by e.site`],
 ['Which account owners have the most overdue responses?',`select owner,count(*)::int as overdue,max(days_overdue)::int as oldest_days from v_case_queue where days_overdue>0 group by owner order by overdue desc,owner`],
 ['Which active service points have no agreement covering today?',`select a.name as account,p.name as site from service_points p join accounts a on a.id=p.account_id where p.status='active' and not exists(select 1 from agreements g where g.point_id=p.id and g.status='active' and current_date between g.start_on and g.end_on) order by p.name`],
 ['Which meters exceed their site limit on the latest interval?',`select distinct on(meter_id) meter,site,unit,per_day,daily_limit from v_usage u where read_on=(select max(read_on) from readings where meter_id=u.meter_id) and per_day>daily_limit order by meter_id,read_on desc`],
 ['Which upcoming moves still have open cases?',`select m.source_id,m.site,m.move_on,count(c.id)::int as open_cases from v_move_queue m join moves x on x.id=m.id join cases c on c.point_id=x.point_id and c.status<>'closed' where m.days_until<=14 group by m.source_id,m.site,m.move_on order by m.move_on`],
 ['Which multi-site accounts need a contact accuracy review?',`select a.name,count(p.id)::int as sites,a.reviewed_on from accounts a join service_points p on p.account_id=a.id where a.reviewed_on is null or current_date-a.reviewed_on>365 group by a.id having count(p.id)>1 order by a.name`],
 ['What disputed amounts remain open, separated by currency?',`select currency,count(*)::int as cases,sum(disputed_amount) as recorded_disputed_amount from cases where status<>'closed' and disputed_amount>0 group by currency order by currency`],
 ['Which meters have no actual reading within the last 35 days?',`select m.name as meter,p.name as site,max(r.read_on) as latest_actual from meters m join service_points p on p.id=m.point_id left join readings r on r.meter_id=m.id and r.kind='actual' where m.active group by m.id,p.name having max(r.read_on) is null or max(r.read_on)<current_date-35 order by m.name`],
 ['Which account retention reviews are overdue alongside open cases?',`select a.name,a.retention_review_on,count(c.id)::int as open_cases from accounts a join service_points p on p.account_id=a.id join cases c on c.point_id=p.id and c.status<>'closed' where a.retention_review_on<current_date group by a.id order by a.retention_review_on`]
];
export function display(value) {
 if(Array.isArray(value)) {
  if(!value.length)return '(none)';
  if(value[0].question)return value.map(x=>x.question+'\n'+display(x.rows)).join('\n\n');
  return table(value,Object.keys(value[0]).filter(k=>k!=='id').map(key=>({key,label:key,width:52})));
 }
 if(value && typeof value==='object')return Object.entries(value).map(([k,v])=>k+'\n'+(typeof v==='object'?display(v):String(v))).join('\n\n');
 return String(value);
}
export function entity(name) { if(!Object.hasOwn(entities,name))throw Error('Unknown entity. Use: '+Object.keys(entities).join(', ')); return entities[name]; }
export async function resolve(db,name,needle,{exact=false}={}) {
 const spec=entity(name); if(!needle || !String(needle).trim())throw Error('A record reference is required');
 const q=String(needle);
 let rows=await db.query(`select * from ${name} where source_id=$1 or id::text=$1`,[q]);
 if(!rows.length && !exact)rows=await db.query(`select * from ${name} where lower(${spec.label})=lower($1)`,[q]);
 if(!rows.length && !exact)rows=await db.query(`select * from ${name} where starts_with(id::text,$1) or position(lower($1) in lower(${spec.label}))>0 order by source_id`,[q]);
 if(rows.length!==1)throw Error(rows.length?'Ambiguous '+name+':\n'+display(rows.map(r=>({id:r.id,source_id:r.source_id,name:r[spec.label]}))):'No '+name+' matches '+q);
 return rows[0];
}
export function normalise(name,obj) {
 const spec=entity(name);if(!obj || Array.isArray(obj)||typeof obj!=='object')throw Error('Record must be an object');
 const out={};
 for(const [k,v] of Object.entries(obj)) {
  if(!spec.fields.includes(k))throw Error('Unsupported '+name+' field: '+k);
  if(v===null || v===''){out[k]=null;continue;}
  if(['archived','active'].includes(k)) {if(![true,false,'true','false'].includes(v))throw Error(k+' must be true or false');out[k]=v===true||v==='true';}
  else if(['notice_days','annual_kwh','daily_limit','value','disputed_amount'].includes(k)) {if(!Number.isFinite(Number(v)))throw Error(k+' must be finite');out[k]=Number(v);}
  else if(k.endsWith('_on')) {if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v))||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(k+' must be a real YYYY-MM-DD date');out[k]=v;}
  else out[k]=String(v).trim();
 }
 return out;
}
export async function insert(db,name,obj,{exactRefs=false}={}) {
 const spec=entity(name),data=normalise(name,obj);
 for(const [k,target] of Object.entries(spec.refs||{}))if(data[k])data[k]=(await resolve(db,target,data[k],{exact:exactRefs})).id;
 const keys=Object.keys(data);if(!keys.length)throw Error('Empty record');
 return (await db.query(`insert into ${name} (${keys.join(',')}) values (${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data)))[0];
}
export async function transaction(db,fn,{dry=false,actor='operator'}={}) {
 await db.exec('BEGIN');
 try {await db.query("select set_config('utility.actor',$1,true)",[actor]);const result=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return result;}
 catch(e){await db.exec('ROLLBACK');throw e;}
}
export async function runRead(db,command) {
 if(Object.hasOwn(reads,command))return db.query(reads[command]);
 if(command==='insights'){const out=[];for(const [question,sql] of questions)out.push({question,rows:await db.query(sql)});return out;}
 if(command==='weekly-review')return {attention:await runRead(db,'attention'),renewals:await runRead(db,'renewals-due'),cases:await runRead(db,'case-queue'),moves:await runRead(db,'move-desk')};
 throw Error('Unknown read: '+command);
}
export async function accountDetails(db,ref) {
 const a=await resolve(db,'accounts',ref);
 return {account:[a],points:await db.query('select * from service_points where account_id=$1 order by name',[a.id]),cases:await db.query('select c.* from cases c join service_points p on p.id=c.point_id where p.account_id=$1 order by c.opened_on',[a.id]),notes:await db.query('select body,author,created_at from notes where account_id=$1 order by created_at',[a.id])};
}
export function outputFile(folder,name,text) {
 const base=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,folder);mkdirSync(base,{recursive:true});
 const file=path.join(base,name);writeFileSync(file,text,{flag:'wx'});return file;
}
export async function draft(db,kind,ref) {
 let title,data;
 if(kind==='weekly-review'){title='Weekly utility service review';data=await runRead(db,'weekly-review');}
 else if(kind==='case-response') {const c=await resolve(db,'cases',ref);title='Case response preparation: '+c.name;data={case:[c],site:[await resolve(db,'service_points',c.point_id)]};}
 else if(kind==='renewal'){const a=await resolve(db,'agreements',ref);title='Renewal review: '+a.name;data=await db.query('select * from v_renewals where id=$1',[a.id]);}
 else throw Error('Unknown draft');
 return {file:outputFile('drafts',kind+'-'+Date.now()+'-'+Math.random().toString(16).slice(2,8)+'.md','# '+title+'\n\nDRAFT. Verify the facts and approve separately. Nothing has been sent.\n\n```text\n'+display(data)+'\n```\n')};
}
export async function exportData(db) {const out={format:'utility-accounts/v1',exported_at:new Date().toISOString()};for(const name of [...Object.keys(entities),'audit_log'])out[name]=await db.query(`select * from ${name} order by id`);return out;}
