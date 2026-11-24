{
  "id": "AS01",
  "scenario": "CFM4 complete 28 items synthetic ratings, deterministic expected aggregate only",
  "instrument": "CFM4",
  "version": "v4",
  "responses": [
    5,
    5,
    5,
    5,
    4,
    4,
    4,
    4,
    3,
    3,
    3,
    3,
    2,
    2,
    2,
    2,
    5,
    5,
    5,
    5,
    4,
    4,
    4,
    4,
    3,
    3,
    3,
    3
  ],
  "expected": {
    "total": 104,
    "item_count": 28,
    "no_missing": true
  },
  "assertions": [
    "show seven actual section subtotals computed from authoritative instrument mapping",
    "show actual instrument version and fixture date",
    "at least one justified strength and one tension",
    "three paths",
    "not spiritual diagnosis"
  ]
}
