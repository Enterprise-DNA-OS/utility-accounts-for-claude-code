import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {parseCsv} from './csv.mjs';
import {entities,normalise,resolve,insert,transaction} from './domain.mjs';
// Labels are report columns selected by the operator, not a claim of a universal Salesforce export layout.
export const headers={
 accounts:{'Account ID':'source_id','Account Name':'name','Account Owner':'owner','Contact Email':'contact_email','Reviewed On':'reviewed_on','Retention Review On':'retention_review_on','Archived':'archived'},
 service_points:{'Service Point ID':'source_id','Account ID':'account_id','Service Point Name':'name','Service Point Number':'identifier','Address':'address','Commodity':'commodity','Region':'region','Status':'status'},
 agreements:{'Agreement ID':'source_id','Service Point ID':'point_id','Agreement Name':'name','Start Date':'start_on','End Date':'end_on','Notice Days':'notice_days','Annual kWh':'annual_kwh','Status':'status'},
 meters:{'Meter ID':'source_id','Service Point ID':'point_id','Meter Name':'name','Serial Number':'serial','Unit':'unit','Daily Limit':'daily_limit','Active':'active'},
 readings:{'Reading ID':'source_id','Meter ID':'meter_id','Read Date':'read_on','Register Value':'value','Reading Type':'kind','Evidence':'evidence'},
 cases:{'Case ID':'source_id','Service Point ID':'point_id','Subject':'name','Category':'category','Case Owner':'owner','Opened Date':'opened_on','Due Date':'due_on','Status':'status','Disputed Amount':'disputed_amount','Currency':'currency','Resolution':'resolution','Closed Date':'closed_on'},
 moves:{'Move ID':'source_id','Service Point ID':'point_id','Move Name':'name','Move Date':'move_on','Direction':'direction','Status':'status','Confirmation':'confirmation'}
};
export async function importSalesforce(db,folder,{dry=false,mapping={},actor='salesforce-import'}={}) {
 if(!folder)throw Error('Supply a folder of Details Only CSV reports');
 for(const [name,map] of Object.entries(mapping)){if(!headers[name])throw Error('Unknown mapping entity: '+name);for(const dest of Object.values(map))if(!entities[name].fields.includes(dest))throw Error('Unsupported mapping destination: '+dest);}
 const batches=[];
 for(const name of Object.keys(headers)) {
  const file=path.join(folder,name+'.csv');if(!existsSync(file))continue;
  const rows=parseCsv(readFileSync(file,'utf8'));if(!rows.length)throw Error(name+'.csv is empty');
  const map={...headers[name],...(mapping[name]||{})};const lookup=new Map(Object.entries(map).map(([k,v])=>[k.toLowerCase(),v]));
  const unknown=Object.keys(rows[0]).filter(k=>!lookup.has(k.toLowerCase())&&!entities[name].fields.includes(k));
  const seen=new Set();
  const data=rows.map((row,i)=>{
   const out={};for(const [key,v] of Object.entries(row)){const dest=lookup.get(key.toLowerCase())||(entities[name].fields.includes(key)?key:null);if(dest){if(Object.hasOwn(out,dest))throw Error(name+': multiple columns map to '+dest);out[dest]=v;}}
   if(!out.source_id)throw Error(name+' row '+(i+2)+': missing source ID');if(seen.has(out.source_id))throw Error(name+': duplicate source ID '+out.source_id);seen.add(out.source_id);
   return normalise(name,out);
  });
  batches.push({name,data,ignored_columns:unknown});
 }
 if(!batches.length)throw Error('No supported CSV files found');
 return transaction(db,async()=>{
  const results=[];
  for(const {name,data,ignored_columns} of batches){let inserted=0,unchanged=0;
   for(const row of data){
    for(const [key,target] of Object.entries(entities[name].refs||{}))if(row[key])row[key]=(await resolve(db,target,row[key],{exact:true})).id;
    const old=(await db.query(`select * from ${name} where source_id=$1`,[row.source_id]))[0];
    if(old){for(const [k,v] of Object.entries(row)){const prior=old[k];if((v===null?prior!==null:typeof v==='number'?Number(prior)!==v:String(prior)!==String(v)))throw Error(name+' '+row.source_id+': changed '+k+'; reconcile explicitly, import does not overwrite');}unchanged++;}
    else {await insert(db,name,row,{exactRefs:true});inserted++;}
   }
   results.push({entity:name,inserted,unchanged,ignored_columns});
  }
  return {dry_run:dry,results};
 },{dry,actor});
}
