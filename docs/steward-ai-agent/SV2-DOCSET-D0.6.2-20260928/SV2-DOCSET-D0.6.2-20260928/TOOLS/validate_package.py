#!/usr/bin/env python3
from pathlib import Path, PurePosixPath
import argparse, hashlib, json, re, zipfile, sys, stat
PACKAGE_ID='SV2-DOCSET-D0.6.2-20260928'
MASTERS=['00_Control_Register.md','02_Framework_Blueprint_Assessments.md','03_Conversation_Sensitive_Safety.md','04_Product_Journey_New_Features.md','05_Data_Privacy_Security.md','06_Safety_Support_Release.md','07_Commerce_Scripture_Rights.md','08_Engineering_Experience_Operations.md','09_Test_Suite_Quality_Control.md','10_Teaching_Reference_Library.md','11_Change_Impact_Decisions.md','Statement-of-Faith.txt']
FAITH_SHA256='b587d8af30ad22d695e48d78608cc6cbbf05d928cd3c6527c58ca305ac9e4e87'
EXCLUDED_PAYLOAD={'MANIFESTS/PAYLOAD_SHA256.json','MANIFESTS/PAYLOAD_SHA256.txt','PACKAGE_MANIFEST.json','SHA256SUMS.txt'}
class ValidationError(Exception): pass
def sha(b): return hashlib.sha256(b).hexdigest()
def safe(name):
    p=PurePosixPath(name)
    if '\\' in name or p.is_absolute() or ':' in name or any(x in ('..','') for x in name.split('/')): raise ValidationError('unsafe path '+name)
def load(path):
    path=Path(path); out={}
    if path.is_dir():
        root=path
        for p in sorted(root.rglob('*')):
            if p.is_symlink(): raise ValidationError('symlink '+str(p))
            if p.is_file():
                r=p.relative_to(root).as_posix(); safe(r); out[r]=p.read_bytes()
    else:
        with zipfile.ZipFile(path) as z:
            infos=[i for i in z.infolist() if not i.is_dir()]
            roots={i.filename.split('/')[0] for i in infos}
            prefix=''
            if 'PACKAGE_MANIFEST.json' not in {i.filename for i in infos}:
                if len(roots)!=1: raise ValidationError('expected one archive root')
                prefix=next(iter(roots))+'/'
            seen=set()
            for i in infos:
                if stat.S_ISLNK(i.external_attr>>16): raise ValidationError('archive symlink')
                r=i.filename[len(prefix):]
                if not r: continue
                safe(r)
                if r in seen: raise ValidationError('duplicate normalized path '+r)
                seen.add(r); out[r]=z.read(i)
    return out
def modules(txt): return dict(re.findall(r'<!-- BEGIN_SOURCE ([\w-]+) -->(.*?)<!-- END_SOURCE \1 -->',txt,re.S))
def validate(path):
    f=load(path)
    if 'PACKAGE_MANIFEST.json' not in f: raise ValidationError('missing PACKAGE_MANIFEST.json')
    m=json.loads(f['PACKAGE_MANIFEST.json'])
    if m.get('package_id')!=PACKAGE_ID or m.get('production_authorized') is not False or m.get('test_case_count')!=175: raise ValidationError('manifest identity mismatch')
    for rec in m['files']:
        b=f.get(rec['path'])
        if b is None or len(b)!=rec['bytes'] or sha(b)!=rec['sha256']: raise ValidationError('package manifest mismatch '+rec['path'])
    pman=json.loads(f['MANIFESTS/PAYLOAD_SHA256.json'])
    for rec in pman['files']:
        b=f.get(rec['path'])
        if b is None or len(b)!=rec['bytes'] or sha(b)!=rec['sha256']: raise ValidationError('payload manifest mismatch '+rec['path'])
    if any(x['path'] in EXCLUDED_PAYLOAD for x in pman['files']): raise ValidationError('payload manifest hashes itself or package manifests')
    sf=f['PROJECT_SOURCES/Statement-of-Faith.txt']
    if sha(sf)!=FAITH_SHA256: raise ValidationError('Statement of Faith hash mismatch')
    active=[x for x in f if x.startswith('PROJECT_SOURCES/') and x.count('/')==1]
    if len(active)!=12 or 'PROJECT_SOURCES/Statement-of-Faith.txt' not in active: raise ValidationError('active source count mismatch')
    if any(x.endswith('/01') or '/01_' in x for x in active): raise ValidationError('unexpected numbered 01 source')
    d04prefix='ARCHIVE/Draft_0_4_Inputs/PROJECT_SOURCES/'
    count=blocks=0
    for name in MASTERS:
        if 'PROJECT_SOURCES/'+name not in f: raise ValidationError('missing source '+name)
        if d04prefix+name not in f: raise ValidationError('missing draft 0.4 source '+name)
        if name=='Statement-of-Faith.txt': continue
        amod=modules(f['PROJECT_SOURCES/'+name].decode('utf-8'))
        bmod=modules(f[d04prefix+name].decode('utf-8'))
        if amod!=bmod: raise ValidationError('preserved source body changed '+name)
        count+=len(amod)
        for k,body in amod.items(): blocks+=len(re.findall(r'<a id="'+re.escape(k)+r'-B\d+"></a>',body))
    if count!=29 or blocks!=7683: raise ValidationError(f'source preservation count mismatch {count}/{blocks}')
    instr=f['PROJECT_INSTRUCTIONS.txt'].decode('utf-8')
    if len(instr)>=8000 or len(instr)+instr.count('\n')>=8000 or 'Draft 0.6.2 / Compact C4.1' not in instr: raise ValidationError('instruction length/identity mismatch')
    il=json.loads(f['EVIDENCE/Instruction_Length.json'])
    if il['characters_including_spaces_and_line_breaks_lf']!=len(instr) or il['characters_if_all_lf_are_crlf']!=len(instr)+instr.count('\n') or il['sha256']!=sha(f['PROJECT_INSTRUCTIONS.txt']): raise ValidationError('instruction length evidence mismatch')
    # current current-section clause headings are unique. Exclude test-case headings like D02-001.
    for path in [x for x in f if x.startswith('PROJECT_SOURCES/') and x.endswith('.md')]:
        current=f[path].decode('utf-8').split('# Full preserved source modules',1)[0]
        ids=[]
        for m in re.finditer(r'^(?:##|###)\s+((?:C|D|E|F|J|M|Q|R|SFT|X)\d{2}|OD-\d+|AMD-\d+)\s+—', current, re.M):
            ids.append(m.group(1))
        dup={x for x in ids if ids.count(x)>1}
        if dup: raise ValidationError('duplicate current heading IDs '+path+' '+','.join(sorted(dup)))
    # feature coverage 48 entries
    cov=json.loads(f['COVERAGE/Feature_Requirement_Test_Coverage_Map.json'])
    if cov.get('feature_count')!=48 or len(cov.get('rows',[]))!=48: raise ValidationError('coverage map 48-entry mismatch')
    return {'ok':True,'files':len(f),'payload_count':pman['payload_count'],'instruction_lf':len(instr),'instruction_crlf':len(instr)+instr.count('\n'),'source_modules':count,'source_blocks':blocks}
if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('path')
    a=ap.parse_args()
    try:
        print(json.dumps(validate(a.path),indent=2))
    except Exception as e:
        print('VALIDATION FAILED:',e,file=sys.stderr); sys.exit(1)
