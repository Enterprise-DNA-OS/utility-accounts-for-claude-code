-- Fictional commercial utility accounts only. Re-running keeps existing records.
insert into accounts (id,source_id,name,owner,contact_email,reviewed_on,retention_review_on) values
('00000000-0000-4000-8000-000000000001','ACC-001','Harbour Cold Stores','Morgan','ops@harbour.example',current_date - 400,current_date + 30),
('00000000-0000-4000-8000-000000000002','ACC-002','Ridge Produce','Taylor','energy@ridge.example',current_date - 10,current_date + 180),
('00000000-0000-4000-8000-000000000003','ACC-003','Southern Workshops','Jordan',null,null,current_date - 5),
('00000000-0000-4000-8000-000000000004','ACC-004','Harbour Warehousing','Morgan','office@warehouse.example',current_date - 20,current_date + 200)
on conflict do nothing;
insert into service_points (id,source_id,account_id,name,identifier,address,commodity,region) values
('00000000-0000-4000-8000-000000000011','SP-001','00000000-0000-4000-8000-000000000001','Harbour Freezer','DEMO-ICP-001','1 Example Quay','electricity','Auckland'),
('00000000-0000-4000-8000-000000000012','SP-002','00000000-0000-4000-8000-000000000001','Harbour Depot','DEMO-ICP-002','2 Example Quay','electricity','Auckland'),
('00000000-0000-4000-8000-000000000013','SP-003','00000000-0000-4000-8000-000000000002','Ridge Packhouse','DEMO-ICP-003','3 Example Road','electricity','Hawkes Bay'),
('00000000-0000-4000-8000-000000000014','SP-004','00000000-0000-4000-8000-000000000003','Southern Workshop','DEMO-ICP-004','4 Example Road','electricity','Canterbury'),
('00000000-0000-4000-8000-000000000015','SP-005','00000000-0000-4000-8000-000000000004','Warehouse Water','DEMO-WATER-005','5 Example Quay','water','Auckland')
on conflict do nothing;
insert into agreements (id,source_id,point_id,name,start_on,end_on,notice_days,annual_kwh) values
('00000000-0000-4000-8000-000000000021','AGR-001','00000000-0000-4000-8000-000000000011','Freezer fixed term',current_date - 350,current_date + 15,30,250000),
('00000000-0000-4000-8000-000000000022','AGR-002','00000000-0000-4000-8000-000000000012','Depot fixed term',current_date - 300,current_date + 65,30,80000),
('00000000-0000-4000-8000-000000000023','AGR-003','00000000-0000-4000-8000-000000000013','Packhouse fixed term',current_date - 200,current_date + 165,45,180000),
('00000000-0000-4000-8000-000000000024','AGR-004','00000000-0000-4000-8000-000000000014','Workshop expired term',current_date - 370,current_date - 5,30,50000)
on conflict do nothing;
insert into meters (id,source_id,point_id,name,serial,unit,daily_limit) values
('00000000-0000-4000-8000-000000000031','MTR-001','00000000-0000-4000-8000-000000000011','Freezer main','DEMO-M001','kWh',900),
('00000000-0000-4000-8000-000000000032','MTR-002','00000000-0000-4000-8000-000000000012','Depot main','DEMO-M002','kWh',300),
('00000000-0000-4000-8000-000000000033','MTR-003','00000000-0000-4000-8000-000000000013','Packhouse main','DEMO-M003','kWh',600),
('00000000-0000-4000-8000-000000000034','MTR-004','00000000-0000-4000-8000-000000000014','Workshop main','DEMO-M004','kWh',200),
('00000000-0000-4000-8000-000000000035','MTR-005','00000000-0000-4000-8000-000000000015','Water main','DEMO-M005','m3',50)
on conflict do nothing;
insert into readings (id,source_id,meter_id,read_on,value,kind,evidence) values
('00000000-0000-4000-8000-000000000100','READ-001','00000000-0000-4000-8000-000000000031',current_date - 62,10000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000101','READ-002','00000000-0000-4000-8000-000000000031',current_date - 32,25000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000102','READ-003','00000000-0000-4000-8000-000000000031',current_date - 2,60000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000103','READ-004','00000000-0000-4000-8000-000000000032',current_date - 61,5000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000104','READ-005','00000000-0000-4000-8000-000000000032',current_date - 31,11000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000105','READ-006','00000000-0000-4000-8000-000000000032',current_date - 1,17500,'estimated','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000106','READ-007','00000000-0000-4000-8000-000000000033',current_date - 60,12000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000107','READ-008','00000000-0000-4000-8000-000000000033',current_date - 30,24000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000108','READ-009','00000000-0000-4000-8000-000000000033',current_date + 0,36000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000109','READ-010','00000000-0000-4000-8000-000000000034',current_date - 90,2000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000110','READ-011','00000000-0000-4000-8000-000000000034',current_date - 60,5000,'actual','Fictional demo meter register'),
('00000000-0000-4000-8000-000000000111','READ-012','00000000-0000-4000-8000-000000000034',current_date - 40,7000,'actual','Fictional demo meter register')
on conflict do nothing;
insert into cases (id,source_id,point_id,name,category,owner,opened_on,due_on,status,disputed_amount,currency) values
('00000000-0000-4000-8000-000000000201','CASE-001','00000000-0000-4000-8000-000000000011','Freezer consumption query','billing-query','Morgan',current_date - 15,current_date - 5,'open',1200,'NZD'),
('00000000-0000-4000-8000-000000000202','CASE-002','00000000-0000-4000-8000-000000000012','Estimated depot bill','meter-query','Morgan',current_date - 10,current_date + 2,'waiting',450,'NZD'),
('00000000-0000-4000-8000-000000000203','CASE-003','00000000-0000-4000-8000-000000000013','Packhouse contact change','account-query','Taylor',current_date - 2,current_date + 5,'open',0,'NZD'),
('00000000-0000-4000-8000-000000000204','CASE-004','00000000-0000-4000-8000-000000000014','Workshop complaint','complaint','Jordan',current_date - 25,current_date - 11,'open',300,'NZD')
on conflict do nothing;
insert into moves (id,source_id,point_id,name,move_on,direction) values
('00000000-0000-4000-8000-000000000301','MOVE-001','00000000-0000-4000-8000-000000000012','Depot occupant change',current_date + 3,'move-out'),
('00000000-0000-4000-8000-000000000302','MOVE-002','00000000-0000-4000-8000-000000000014','Workshop account transfer',current_date - 2,'move-in'),
('00000000-0000-4000-8000-000000000303','MOVE-003','00000000-0000-4000-8000-000000000015','Warehouse handover',current_date + 25,'move-in')
on conflict do nothing;
