#!/usr/bin/env python3
"""Independent static check of V2 feature/test links. Expects one extracted package root.

Exit 1 if test IDs are missing, feature IDs are unknown, or either direction lacks a declared relation.
This is a documentation/static check, not an AI/application test.
"""
import sys, csv, re, pathlib
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()

def read_rows(path):
    with (root/path).open(encoding='utf-8-sig',newline='') as f:
        return list(csv.DictReader(f))

def expand(s):
    out=[]
    for token in s.split(';'):
        token=token.strip().replace('–','-').replace('—','-')
        if not token: continue
        if token.startswith('REL-D072-') and re.fullmatch(r'REL-D072-\d+-\d+',token):
            prefix,start,end=token.rsplit('-',2)
            out.extend(f'{prefix}-{i:0{len(start)}d}' for i in range(int(start),int(end)+1))
            continue
        m=re.fullmatch(r'([A-Za-z_]+)(\d+)-([A-Za-z_]*)(\d+)',token)
        if m and m.group(3) in ('',m.group(1)):
            prefix,start,_,end=m.groups()
            out.extend(f'{prefix}{i:0{len(start)}d}' for i in range(int(start),int(end)+1))
        else: out.append(token)
    return out

features=read_rows('MATRICES/Feature_Requirement_Test_Crosswalk.csv')
tests=read_rows('TESTS/Acceptance_Test_Matrix.csv')
forward={x['current_feature_id']:set(expand(x['associated_tests'])) for x in features}
reverse={t['test_id']:set(t['feature_ids'].split(';')) for t in tests}
errors=[]
for fid,tids in forward.items():
    for tid in sorted(tids):
        if tid not in reverse: errors.append((fid,tid,'declared test does not exist'))
        elif fid not in reverse[tid]: errors.append((fid,tid,'feature says test covers it; test lacks backlink'))
for tid,fids in reverse.items():
    for fid in sorted(fids):
        if fid not in forward: errors.append((fid,tid,'test refers to unknown feature'))
        elif tid not in forward[fid]: errors.append((fid,tid,'test says it covers feature; feature lacks forward link'))
if errors:
    for fid,tid,description in errors: print(f'FAIL: {fid} / {tid} — {description}')
    print(f'FAIL — {len(errors)} inconsistent feature/test links across {len({e[0] for e in errors})} features')
    sys.exit(1)
print(f'PASS — {len(features)} features and {len(tests)} tests have reciprocal declared links (static only; no execution)')
