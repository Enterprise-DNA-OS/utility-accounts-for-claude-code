import assert from 'node:assert/strict';
import pg from 'pg';
import {migrate} from './migrate.mjs';
import {seed} from './seed.mjs';
import {runRead,reads,transaction,insert} from './lib/domain.mjs';
import {importSalesforce} from './lib/import.mjs';
import path from 'node:path';
if(!process.env.TEST_DATABASE_URL)throw Error('TEST_DATABASE_URL must point to a disposable test database');
pg.types.setTypeParser(1082,v=>v);pg.types.setTypeParser(1114,v=>v);
const client=new pg.Client({connectionString:process.env.TEST_DATABASE_URL});
await client.connect();const schema='utility_test_'+process.pid+'_'+Date.now();
const db={query:async(s,p=[])=>(await client.query(s,p)).rows,exec:s=>client.query(s)};
try{
 await client.query(`create schema ${schema}`);await client.query(`set search_path to ${schema},public`);
 await migrate(db);await seed(db);await seed(db);
 for(const c of [...Object.keys(reads),'weekly-review','insights'])assert.ok(await runRead(db,c));
 assert.equal((await runRead(db,'reading-exceptions')).length,4);
 const root=path.resolve(import.meta.dirname,'..');
 await importSalesforce(db,path.join(root,'examples/salesforce'),{dry:true});
 const imported=await importSalesforce(db,path.join(root,'examples/salesforce'));assert.equal(imported.results.length,7);
 assert.ok((await importSalesforce(db,path.join(root,'examples/salesforce'))).results.every(x=>x.inserted===0));
 await assert.rejects(()=>transaction(db,()=>db.exec("update cases set status='closed' where source_id='CASE-001'")),/constraint/);
 await assert.rejects(()=>transaction(db,()=>db.exec("update moves set status='confirmed' where source_id='MOVE-001'")),/constraint/);
 console.log('PASS PostgreSQL migration, seed, all reads, linked import, repeat and closure guards');
}finally{await client.query('reset search_path');await client.query(`drop schema if exists ${schema} cascade`);await client.end();}
