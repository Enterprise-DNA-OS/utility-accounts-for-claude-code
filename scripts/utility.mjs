#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {getDb} from './lib/db.mjs';
import {reads,entities,display,runRead,accountDetails,resolve,insert,transaction,draft,exportData,outputFile,normalise} from './lib/domain.mjs';
import {importSalesforce} from './lib/import.mjs';
const raw=process.argv.slice(2),args=[],opts={};
for(let i=0;i<raw.length;i++){const a=raw[i];if(!a.startsWith('--'))args.push(a);else{const eq=a.indexOf('='),key=a.slice(2,eq<0?undefined:eq);if(['json','dry-run','help'].includes(key)){if(eq>=0)throw Error(key+' takes no value');opts[key]=true;}else{const value=eq>=0?a.slice(eq+1):raw[++i];if(value===undefined||value.startsWith('--'))throw Error('Missing value for '+key);opts[key]=value;}}}
const [command,ref,third]=args;
const help=`Utility Accounts CLI\nRead: ${[...Object.keys(reads),'weekly-review','insights','account <reference>'].join(', ')}\nWrite: add <entity> --file=<record.json>; record-reading --file=<reading.json>; resolve-case <reference> --resolution=<text>; review-account <reference> --email=<email>; confirm-move <reference> --evidence=<reference>; log <account> --text=<note>\nDraft: draft-weekly-review; draft-renewal <agreement>; draft-case-response <case>\nImport: import salesforce <folder> [--mapping=<file>] [--dry-run]\nExport: export\nAll commands accept --json. Mutations accept --actor=<name>.\nEntities: ${Object.keys(entities).join(', ')}`;
if(!command||opts.help||command==='help'){console.log(help);process.exit(0);}
const allowed=new Set(['json','actor','dry-run','mapping','file','resolution','email','evidence','text']);
let db;
try {
 for(const k of Object.keys(opts))if(!allowed.has(k))throw Error('Unknown option: --'+k);
 if(opts['dry-run']&&command!=='import')throw Error('--dry-run is supported by import only');
 const known=[...Object.keys(reads),'weekly-review','insights','account','add','record-reading','resolve-case','review-account','confirm-move','log','draft-weekly-review','draft-renewal','draft-case-response','import','export'];
 if(!known.includes(command))throw Error('Unknown command: '+command+'\n'+help);
 const actor=opts.actor||'operator';db=await getDb();let result;
 if(Object.hasOwn(reads,command)||['weekly-review','insights'].includes(command))result=await runRead(db,command);
 else if(command==='account')result=await accountDetails(db,ref);
 else if(command==='import'){if(ref!=='salesforce')throw Error('Only import salesforce is supported');result=await importSalesforce(db,third,{dry:!!opts['dry-run'],mapping:opts.mapping?JSON.parse(readFileSync(opts.mapping,'utf8')):{},actor});}
 else if(command==='export'){const data=await exportData(db);result={file:outputFile('exports','utility-'+Date.now()+'.json',JSON.stringify(data,null,2)+'\n'),counts:Object.fromEntries(Object.entries(data).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]))};}
 else if(command.startsWith('draft-'))result=await draft(db,command.slice(6),ref);
 else result=await transaction(db,async()=>{
  if(command==='add'||command==='record-reading'){if(!opts.file)throw Error('--file is required');return [await insert(db,command==='add'?ref:'readings',JSON.parse(readFileSync(opts.file,'utf8')))];}
  if(command==='resolve-case'){const c=await resolve(db,'cases',ref);if(c.status==='closed')throw Error('Case already closed');if(!opts.resolution?.trim())throw Error('--resolution is required');return db.query("update cases set status='closed',resolution=$1,closed_on=current_date where id=$2 returning source_id,status,resolution",[opts.resolution,c.id]);}
  if(command==='review-account'){const a=await resolve(db,'accounts',ref);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email||''))throw Error('--email must be valid');return db.query('update accounts set contact_email=$1,reviewed_on=current_date where id=$2 returning source_id,contact_email,reviewed_on',[opts.email,a.id]);}
  if(command==='confirm-move'){const m=await resolve(db,'moves',ref);if(m.status!=='pending')throw Error('Only pending move records can be confirmed');if(!opts.evidence?.trim())throw Error('--evidence is required');return db.query("update moves set status='confirmed',confirmation=$1 where id=$2 returning source_id,status,confirmation",[opts.evidence,m.id]);}
  if(command==='log'){const a=await resolve(db,'accounts',ref);if(!opts.text?.trim())throw Error('--text is required');return [await insert(db,'notes',{source_id:'NOTE-'+Date.now()+'-'+Math.random().toString(16).slice(2,8),account_id:a.id,body:opts.text,author:actor})];}
  throw Error('Unsupported command');
 },{actor});
 console.log(opts.json?JSON.stringify(result,null,2):display(result));
} catch(e) { console.error(opts.json?JSON.stringify({error:e.message}):'Error: '+e.message);process.exitCode=1; }
finally { if(db)await db.close(); }
