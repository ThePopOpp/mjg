import re, json, hashlib, collections, difflib
from pathlib import Path
from zipfile import ZipFile
BASE=Path('/mnt/data'); out=BASE/'steward_d06_review'
def sha(b): return hashlib.sha256(b).hexdigest()
def load_zip(p):
 z=ZipFile(p); names=[x for x in z.namelist() if not x.endswith('/')]; prefix=names[0].split('/')[0]+'/'
 return z,{n[len(prefix):]:z.read(n) for n in names},prefix
z6,m6,p6=load_zip(BASE/'SV2-DOCSET-D0.6-20260928.zip')
z4,m4,p4=load_zip(BASE/'Steward_Complete_Project_Package_Draft_0_4_2026-09-26.zip')
z51,m51,p51=load_zip(BASE/'SV2-DOCSET-D0.5.1-20260928.zip')
r={'files':len(m6),'zip_sha256':sha((BASE/'SV2-DOCSET-D0.6-20260928.zip').read_bytes()),'zip_integrity_bad_member':z6.testzip(),'baseline_zip_sha256':sha((BASE/'Steward_Complete_Project_Package_Draft_0_4_2026-09-26.zip').read_bytes()),'baseline_files':len(m4),'source_files':[f for f in m6 if f.startswith('PROJECT_SOURCES/')],'duplicate_members':[k for k,v in collections.Counter(z6.namelist()).items() if v>1]}
hashes=json.loads(m6['MANIFESTS/SHA256SUMS.json']);r['manifest_count']=len(hashes)
r['manifest_mismatches']=[{'path':p,'recorded':s,'actual':sha(m6[p]) if p in m6 else None} for p,s in hashes.items() if p not in m6 or sha(m6[p])!=s]
r['unmanifested_members']=sorted(set(m6)-set(hashes));r['embedded_zip_hash']=m6['MANIFESTS/ZIP_SHA256.txt'].decode().strip()
txt=m6['PROJECT_INSTRUCTIONS.txt'].decode();t=txt.replace('\r\n','\n').replace('\r','\n');r['instructions']={'lf_chars':len(t),'crlf_chars':len(t.replace('\n','\r\n')),'sha256':sha(m6['PROJECT_INSTRUCTIONS.txt'])}
r['faith_unchanged']=m6['PROJECT_SOURCES/Statement-of-Faith.txt']==m4['PROJECT_SOURCES/Statement-of-Faith.txt']
r['faith_sha256']=sha(m6['PROJECT_SOURCES/Statement-of-Faith.txt'])
r['source_modules']=[];r['source_tail_comparison']=[];r['duplicate_current_heading_ids']={}
r['stale_current_lines']={};total=0
for f in r['source_files']:
 if not f.endswith('.md'):continue
 a=m4[f].decode();b=m6[f].decode();bs=list(re.finditer(r'<!-- BEGIN_SOURCE ([\w-]+) -->(.*?)<!-- END_SOURCE \1 -->',b,re.S));am={k:v for k,v in re.findall(r'<!-- BEGIN_SOURCE ([\w-]+) -->(.*?)<!-- END_SOURCE \1 -->',a,re.S)}
 for mm in bs:
  k,body=mm.group(1),mm.group(2); n=len(re.findall(r'<a id="'+re.escape(k)+r'-B\d+"',body));total+=n
  r['source_modules'].append({'file':f,'id':k,'blocks':n,'unchanged':body==am.get(k),'sha256_utf8':sha(body.encode())})
 r['source_tail_comparison'].append({'file':f,'unchanged':a[a.index('<!-- BEGIN_SOURCE'):]==b[b.index('<!-- BEGIN_SOURCE'):]})
 front=b[:b.index('# Full preserved source modules')]
 ids=re.findall(r'^#{2,4} ((?:C|D|E|J|M|Q|X)\d{2})\b',front,re.M); c=collections.Counter(ids);r['duplicate_current_heading_ids'][f]={k:v for k,v in c.items() if v>1}
 lines=[]
 for i,line in enumerate(front.splitlines(),1):
  if re.search(r'(current|install|baseline|snapshot|Compact|Draft 0\.5)',line,re.I) and re.search(r'Draft 0\.[345]|SV2-DOCSET-D0\.[345]',line):
   lines.append({'line':i,'text':line})
 r['stale_current_lines'][f]=lines
r['source_block_total']=total
r['archived_d04_sources_unchanged']=all(m6['ARCHIVE/Draft_0_4_Inputs/'+f]==m4[f] for f in r['source_files'])
r['unique_test_ids']={}
pat=r'^### ((?:V2-[A-Z]\d+(?:-[A-Z])?|D02-\d{3}|DEC09-T\d{2}|D04-\d{3}))\b'
for label,m in [('d04',m4),('d06',m6)]:
 tests=re.findall(pat,m['PROJECT_SOURCES/09_Test_Suite_Quality_Control.md'].decode(),re.M)
 r['unique_test_ids'][label]={'count':len(set(tests)),'duplicate_ids':[k for k,v in collections.Counter(tests).items() if v>1],'ids':tests}
r['test_ids_equal']=set(r['unique_test_ids']['d04']['ids'])==set(r['unique_test_ids']['d06']['ids'])
r['d04_companion_detail']=[{'path':f,'bytes':len(b),'direct_path_present':f in m6,'same_bytes_if_present':m6.get(f)==b} for f,b in m4.items() if f.startswith(('CONFIG/','RELEASE_TEMPLATES/','TOOLS/','TESTING/','EVIDENCE/','AGENT_PROMPTS/','CHANGE_RECORDS/'))]
r['acceptance_script_sizes']={f:len(b) for f,b in m6.items() if f.startswith('ACCEPTANCE_SCRIPTS/')}
r['diff_files_d051']=[{'file':f,'old_bytes':len(m51[f]) if f in m51 else None,'new_bytes':len(b)} for f,b in m6.items() if f not in m51 or m51[f]!=b]
(out/'D06_Verification_Measurements.json').write_text(json.dumps(r,indent=2))
print(json.dumps({k:v for k,v in r.items() if k not in ['stale_current_lines','d04_companion_detail','diff_files_d051','unique_test_ids','source_modules','source_tail_comparison']},indent=2))
print('modules',len(r['source_modules']),'equal',sum(x['unchanged'] for x in r['source_modules']))
print('test counts',[(k,v['count']) for k,v in r['unique_test_ids'].items()])
print('\nStale lines for manual classification\n')
for f,lines in r['stale_current_lines'].items():
 print(f)
 for l in lines:print(l['line'],l['text'][:800])
