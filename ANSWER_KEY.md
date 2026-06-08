# APEXRANK ANSWER KEY
## Server-Side Only — Never Expose to Client

---

## TUTORIAL — Pattern Recognition Protocol

### Visual Asset Descriptions & Answers

| Variant ID | Asset Description | Meaningful Signals | Distractors | Correct Answer |
|---|---|---|---|---|
| TUT-01 | Grid of 16 symbols: circles, triangles, squares, stars in 4 colors | Only red symbols form a pattern reading clockwise: RED-CIRCLE, RED-TRIANGLE, RED-SQUARE, RED-STAR → spells "RISE" via first letters | Blue/yellow/green symbols are random noise | RISE |
| TUT-02 | Binary sequence chart: 01010010 01001001 01010011 01000101 | ASCII binary decodes to "RISE" | Extra 0-padding in some bytes, random bit flips in non-significant positions | RISE |
| TUT-03 | Scatter plot with 4 clusters labeled A-D | Cluster centroids spell line: A(1,1) B(4,5) C(8,2) D(3,7) → connect in order reads "KEY" | Outliers intentionally placed at (10,10), (0,9) | KEY |
| TUT-04 | Color wheel with 8 segments, each with a number | Only prime-numbered segments matter: 2(GREEN), 3(BLUE), 5(RED), 7(YELLOW) → first letters spell "GBRY" → reverse: "YRBG" is wrong, actual answer is "CODE" from pigment names | Even numbers, segment sizes, brightness levels | CODE |
| TUT-05 | Morse code sequence: .-- .- .-.. .-.. | Decodes to "WALL" | Extra dashes between letters, varying pause lengths | WALL |
| TUT-06 | Periodic table excerpt with 5 elements highlighted in red | Atomic numbers: 6(C), 8(O), 20(Ca), 14(Si), 6(C) → first two: CO, combine rest: CaSiC → "COCA-SIC" is distractor, actual: 6=C, 8=O, 20=Ca(pital), 14=Si(licon), 6=C → "CO" + "CaSiC" → but real answer ignores Ca → "COSIC" reversed: "CISOC" → filtered: "CLIMB" | Element colors, atomic weights, group numbers | CLIMB |
| TUT-07 | Floor plan with 4 rooms labeled N, S, E, W with arrows | Arrows in each room: N→?, S→?, E→?, W→? reading clockwise: N→E, E→S, S→W, W→N → forms a loop, path spells "NESW" → answer: "CYCLE" | Furniture positions, door sizes, window counts | CYCLE |
| TUT-08 | Bar chart of "Tower Energy Levels" over 5 days | Day 1: 10, Day 2: 20, Day 3: 30, Day 4: 40, Day 5: 50 → sequence difference = 10 each → 10+20+30+40+50=150 → first digit of each: 1,2,3,4,5 → "ONE" is wrong, "FIFTEEN" is answer | Grid lines, axis labels, legend colors | FIFTEEN |
| TUT-09 | Image of a circuit board with 6 labeled connection points | Points J1, U2, N5, K4, E3, I6 → first letters: J U N K E I → "JUNKEI" → remove J and I → "UNKE" → "UNKE" reversed "EKNU" → read as "UNKNOWN" → actual answer: "ENIGMA" | Capacitor values, resistor color bands, trace widths | ENIGMA |
| TUT-10 | Heatmap of 9 squares in a 3×3 grid with varying intensity | Hottest cell: center (R=255,G=0,B=0) → coords (2,2). Second hottest: top-left → (1,1) = 1,1. Third: bottom-right → (3,3). Pattern: (2,2)(1,1)(3,3) → read column: 2,1,3 → row: 2,1,3 → "213213" → base64 decode nonsense → actual: center pixel hex #FF0000 → red → "R" → 3 brightest cells = R, G, B → "RGB" → "TOWER" from letters in cells | Color legend scale, surrounding cooler cells | TOWER |

**Tutorial Scoring:**
- Correct on first attempt: 150 points
- Correct on second attempt: 100 points
- Correct on third attempt: 50 points
- Hints used: -25 points per hint
- Bonus: Under 60 seconds: +50 points

---

## LEVEL 1 — Visual Intelligence Assessment

### Image Asset Pool

| Variant ID | Image Description | Hidden Mission Key | Prompt Quality Hints |
|---|---|---|---|
| LV1-01 | Ancient map with 5 landmarks, compass rose, and 3 route lines | ASCEND (first letters of landmarks on correct route: A→S→C→E→N→D) | Compass rose is rotated 15° — player must notice true north |
| LV1-02 | Photograph of server rack with 7 blinking LEDs, 4 stable, 2 off | APEX (blinking LEDs form binary: A=01000001, P=01010000, E=01000101, X=01011000) | LED colors are irrelevant; only blink pattern matters |
| LV1-03 | Blueprint of Tower floors 1-10 with 3 doors marked on each floor | ELEVATE (correct door sequence: floor 1=E, 2=L, 3=E, 4=V, 5=A, 6=T, 7=E) | Some doors lead to "dead end" marking — ignore those |
| LV1-04 | Chemical structure diagram with 8 compounds and reaction arrows | BOND (follow reaction arrows that have bold outlines, read compound initials) | Thin arrows are distractors; only bold arrows matter |
| LV1-05 | Constellation chart with 6 connected star groups | SCALE (star magnitude values: S=2, C=4, A=8, L=12, E=5 → pattern is powers of 2 except last) | Grid coordinates on chart edges are intentionally wrong |
| LV1-06 | Financial graph "Tower Holdings" with 4 trend lines | CORE (only the line crossing y=0 at x=2 matters; read slope indicator letters) | Volume bars, moving averages, RSI indicators are noise |
| LV1-07 | DNA sequence diagram with 4 base pairs highlighted | NUCLEUS (highlighted pairs: N-C, A-U, C-A, G-U, C-U, A-G, U-C → first letters) | Backbone markers, hydrogen bond counts are irrelevant |
| LV1-08 | Chess endgame board with 6 pieces remaining | CHECKMATE (knight path from current position visits squares: C4, H3, E2, C1, K2, M2, A4, T4, E2 → first letters spell CHECKMATE) | Board orientation is reversed; player must notice |
| LV1-09 | Architectural cross-section of Tower levels 20-30 | VERTEX (structural nodes on load-bearing walls form pattern when connected) | Non-load-bearing walls are decorative distractors |
| LV1-10 | Radial network diagram with 7 concentric rings | RADIUS (only rings with odd-numbered labels matter: R=1, A=3, D=5, I=7, U=9, S=11 → first letters) | Even-numbered rings are thinner but irrelevant |

... (10 more variants, following same pattern)

### Level 1 Scoring Rules:
- Key extracted: +200 points
- Prompts remaining: +10 points each unused
- Time bonus: <5min = +100, <10min = +50, <15min = +25
- Wrong submission: -50 points

---

## LEVEL 2 — Fault Injection (Alliance/Solo)

### Code Fault Variants

| Variant ID | File Type | Error Type | Code/Content | Line | Expected Fragment | Explanation |
|---|---|---|---|---|---|---|
| L2-C01 | JavaScript | Null Reference | `let user = getUser(id); return user.name;` (user may be null) | 3 | NEX | getUser can return null when id is invalid |
| L2-C02 | Python | Off-by-One | `for i in range(len(arr)): arr[i] = arr[i+1]` | 2 | ION | i+1 exceeds bounds on last iteration |
| L2-C03 | Java | Type Mismatch | `int count = "5";` | 1 | TYP | String assigned to int without cast |
| L2-C04 | YAML | Indentation | `config:\n  key:\nvalue: 5` (value misaligned) | 3 | IND | value is at wrong indent level |
| L2-C05 | SQL | Logic Inversion | `WHERE status != 'ACTIVE'` (should be `=`) | 4 | INV | Condition inverted from intended logic |
| L2-C06 | C++ | Memory Leak | `int* p = new int[10]; return;` (no delete) | 2 | MEM | Memory allocated but never freed |
| L2-C07 | Python | Division by Zero | `ratio = x / (y - y)` | 3 | DIV | Denominator always evaluates to 0 |
| L2-C08 | Go | Defer Misuse | `defer file.Close()` inside loop | 5 | DEF | Defer accumulates, leaks file handles |
| L2-C09 | Rust | Ownership | `let s = String::from("hi"); let s2 = s; println!(s);` | 3 | OWN | s moved to s2, cannot use later |
| L2-C10 | Ruby | Nil Method | `nil.split(",")` | 2 | NIL | Calling .split on nil value |

### Document Fault Variants (L2-D01 to L2-D10)

| Variant | Error | Fragment |
|---|---|---|
| L2-D01 | "Research published in 2025" (current year is 2024) | DAT |
| L2-D02 | "Total: 150%" (percentages exceed 100) | SUM |
| L2-D03 | Signatory date is before document creation date | TIM |
| L2-D04 | "Version 3.0" referred to as "initial draft" | VER |
| L2-D05 | Mismatched figure numbers (Fig 4 references nonexistent) | FIG |
| L2-D06 | Author name misspelled differently in header vs footer | ATH |
| L2-D07 | Citation references a study that doesn't exist | CIT |
| L2-D08 | Company name changed mid-document | COR |
| L2-D09 | Currency symbol changed from $ to € inconsistently | CUR |
| L2-D10 | "Confidential" watermark inconsistent with access level | SEC |

### Log Fault Variants (L2-L01 to L2-L10)

| Variant | Anomaly | Fragment |
|---|---|---|
| L2-L01 | Login from geographic impossible location (same user, 2 countries, 1 min apart) | GEO |
| L2-L02 | Successful login after 47 failed attempts with no lockout | LCK |
| L2-L03 | File deleted before it was created in log sequence | DEL |
| L2-L04 | Timestamps in future | FUT |
| L2-L05 | User "admin" performing action that admin shouldn't have permission for | PRM |
| L2-L06 | Two different user IDs on same session | SES |
| L2-L07 | Log entry from decommissioned server | SRV |
| L2-L08 | Heartbeat continues after shutdown signal | HBT |
| L2-L09 | Duplicate transaction with same ID | DUP |
| L2-L10 | Encryption key rotation with no prior key | KEY |

### Level 2 Scoring:
- Correct fault identified: +150 points
- Correct error type: +100 points
- Fragment extracted: +50 points
- Wrong identification: -30 points
- Time bonus: <5min = +75

---

## LEVEL 3 — Signal Recovery (Alliance/Solo)

### Audio/Signal Variants

| Variant ID | Signal Type | Source | Key Identifier | Fragment | Verification Source |
|---|---|---|---|---|---|
| L3-A01 | Speech clip | Apollo 13 "Houston, we have a problem" | The moon landing mission, Jim Lovell | US | NASA archives transcript |
| L3-A02 | Morse code | "... --- ..." (SOS) + surrounding signal | Standard distress signal | SOS | International maritime signal registry |
| L3-A03 | Song fragment (instrumental) | "Thus Spoke Zarathustra" opening | Richard Strauss, 2001: A Space Odyssey | STA | Classical music databases |
| L3-A04 | Dial-up modem sound | 56k connection handshake | Dial-up internet connection (1990s) | DIA | Tech history archives |
| L3-A05 | Speech clip | MLK "I Have a Dream" | Martin Luther King Jr., Lincoln Memorial 1963 | DRE | National Archives speech catalog |
| L3-A06 | DTMF tones | 4-8-1-5-2-6 | Telephone keypad digits | KEY | Telecommunication standards |
| L3-A07 | Bird call | Northern Cardinal | Cardinalis cardinalis, North America | CRD | Cornell Ornithology Lab |
| L3-A08 | Sonar ping sequence | Naval sonar pattern | Active sonar, submarine detection | SON | Naval sonar frequency tables |
| L3-A09 | Radio broadcast fragment | "This is London" BBC World Service | BBC World Service, 1930s-present | BBC | BBC archives |
| L3-A10 | Engine sound | Rolls-Royce Merlin engine | Supermarine Spitfire, WWII | MER | WWII aircraft engine databases |

... (10 more audio variants)

### Level 3 Scoring:
- Correct identification: +200 points
- Fragment extracted: +100 points
- External source cited: +50 points
- Time bonus: <5min = +75

---

## MERGE TABLE

Valid fragment pair combinations that produce the Level 4+5 unlock key:

| Fragment A | Fragment B | Combined Key |
|---|---|---|
| NEX | US | NEXUS |
| ION | TYP | IONTYP |
| MEM | DIV | MEMDIV |
| DEF | OWN | DEFOWN |
| NIL | DAT | NILDAT |
| SUM | TIM | SUMTIM |
| VER | FIG | VERFIG |
| ATH | CIT | ATHCIT |
| COR | CUR | CORCUR |
| SEC | GEO | SECGEO |
| LCK | DEL | LCKDEL |
| FUT | PRM | FUTPRM |
| SES | SRV | SESERV |
| HBT | DUP | HBTDUP |
| KEY | US | KEYUS |
| SOS | DIA | SOSDIA |
| STA | DRE | STADRE |
| CRD | SON | CRDSON |
| BBC | MER | BBCMER |

**Merge Rule:** The two fragments are concatenated in order (A + B). The combined key is session-unique and stored as-is. This combined key unlocks Level 4 access.

---

## LEVEL 4 — Research Protocol

### Variants

| Variant ID | Topic | Claim Made | Actual Finding | Flaw Type | Research Key |
|---|---|---|---|---|---|
| L4-01 | AI Benchmark | "Claude 4 achieves 99.9% on GPQA" | Claude 4 scores 87.3%; 99.9% is from a cherry-picked subset | Cherry-picked data | GPQA |
| L4-02 | Climate Study | "Temperatures rising 3x faster than models predict" | Error in baseline calculation | Methodological flaw | BASELINE |
| L4-03 | Drug Trial | "90% recovery rate" | 90% of 20 patients (n=20), not statistically significant | Sample size | SAMPLE |
| L4-04 | Economic Report | "Unemployment at record low of 2.1%" | Uses U-3 measure not U-6; U-6 is 8.4% | Metric manipulation | U6 |
| L4-05 | Benchmark | "10x faster than previous version" | Tests run on different hardware configurations | Uncontrolled variables | VARIABLE |
| L4-06 | Survey | "85% of developers prefer Tool X" | Survey conducted on Tool X's own forum | Selection bias | BIAS |
| L4-07 | Historical Claim | "Event caused 5000 casualties" | Primary sources say 1200; number inflated | Source integrity | SOURCE |
| L4-08 | Tech Spec | "Battery lasts 48 hours" | Tested under ideal conditions only | Real-world gap | REAL |
| L4-09 | Educational | "Method improves scores by 40%" | No control group in study | Missing control | CONTROL |
| L4-10 | Security | "0 vulnerabilities in 2024" | Only counting published CVEs, not discovered-but-embargoed | Reporting scope | SCOPE |

### Level 4 Scoring:
- Flaw identified: +200 points
- Research key extracted: +100 points
- Supporting evidence cited: +50 points
- Candidate B communication quality: +50 points (alliance only)

---

## LEVEL 5 — Decision Report

### Report Variants (linked to Level 4 variants)

For each Level 4 variant, a companion dataset is provided that contains both reliable and unreliable evidence.

| Base L4 | L5 Dataset ID | Reliable Evidence | Unreliable Evidence | Correct Conclusion |
|---|---|---|---|---|
| L4-01 | L5-01 | Official benchmark results (87.3%) | Unpublished blog post claiming 99.9% | "Claude 4 achieves 87.3% on GPQA; 99.9% claim is cherry-picked" |
| L4-02 | L5-02 | Raw temperature data | Adjusted data with incorrect baseline | "Temperature rise is within expected range; faulty baseline caused alarm" |
| L4-03 | L5-03 | Full trial data (n=20, 18 recovered) | Press release claiming "90% breakthrough" | "Recovery rate of 90% is not statistically significant due to small sample" |
| L4-04 | L5-04 | U-6 unemployment figures | U-3 figures presented as comprehensive | "Record low claim is based on narrow metric; broader U-6 shows 8.4%" |
| L4-05 | L5-05 | Hardware specs of both test environments | Speedup claim without normalization | "10x claim is unsubstantiated without controlling for hardware differences" |
| L4-06 | L5-06 | Survey methodology documentation | "85% preference" statistic | "Selection bias invalidates the 85% preference claim" |
| L4-07 | L5-07 | Primary source documents | Memorial plaque with inflated figure | "Actual casualties are approximately 1200 per primary sources" |
| L4-08 | L5-08 | Real-world battery test results | Manufacturer spec sheet claims | "48-hour claim is under ideal lab conditions; real-world is ~24 hours" |
| L4-09 | L5-09 | Raw study data without comparison | Educational method study abstract | "No control group means the 40% improvement claim is unsupported" |
| L4-10 | L5-10 | Embargoed vulnerability reports | Published CVE count only | "Zero vulnerabilities is a reporting scope claim; embargoed vulns exist" |

### Level 5 Scoring Rubric:

**Section scoring (max 400 points total):**
- CONCLUSION (100 pts): Correctness, clarity, directness
- EVIDENCE USED (100 pts): Relevant sources cited, accuracy
- EVIDENCE REJECTED (100 pts): Correctly identified unreliable evidence, valid reasoning
- REASONING CHAIN (100 pts): Logical flow, proper deduction

**Penalties:**
- Including unreliable evidence as reliable: -50 per instance
- Missing key conclusion: -100
- Vague or ambiguous reasoning: -30

---

## FINAL APEX RACE

### Premium Challenge Pool

| Variant ID | Scenario | Authentic Evidence | Fabricated Evidence | Correct Answer | Verification Sources |
|---|---|---|---|---|---|
| FIN-01 | Fake product launch: "NovaTech Fusion" claimed as breakthrough | Patent filing (exists), independent review (exists, negative) | Fake press release, fabricated customer testimonials | "NovaTech Fusion is an existing product with negative reviews; launch claims are fabricated" | USPTO database, independent review sites |
| FIN-02 | Incident report: "Data breach at FinCore Bank" | Real breach notification (actual 2023 event), real impact assessment | Fake CEO statement blaming interns, fake "no customer impact" claim | "Breach is real but severity is understated by fabricated statements" | News archives 2023, SEC filings |
| FIN-03 | News story: "AI discovers new cancer treatment" | Real research paper (preliminary, in-vitro only) | Fabricated clinical trial results, fake patient testimonials | "AI was used in preliminary research only; no human trials exist" | PubMed, clinicaltrials.gov |
| FIN-04 | Scientific claim: "Water found on Mars in abundance" | Real NASA data (trace amounts confirmed) | Fabricated quantity claims, fake NASA press release | "Trace water confirmed but abundance claims are fabricated" | NASA official releases, peer-reviewed papers |
| FIN-05 | Tech comparison: "New chip 1000x faster" | Real chip announcement (2x improvement over previous) | Fabricated benchmark numbers, fake comparison chart | "Actual improvement is ~2x; 1000x claim is fabricated" | Manufacturer specs, independent benchmarks |

... (20 more final challenge variants)

### Final Race Thresholds

- Answer Correct: binary (pass/fail)
- Confidence Score ≥ 90%: player slider, cross-referenced with actual accuracy
- Evidence Quality Score ≥ 90%: AI judge evaluates cited sources

### Win Condition

First player to pass ALL THREE thresholds wins. If both pass within same submission window, the player with higher combined score wins.

### Combined Score Formula

```
combined_score = (accuracy * 0.4) + (confidence_match * 0.3) + (evidence_quality * 0.3)
```

Where:
- accuracy: 1.0 for correct answer, 0.0 for incorrect
- confidence_match: 1.0 - abs(self_declared_confidence - actual_accuracy)
- evidence_quality: AI judge score (0.0 to 1.0)

---

## ELO CALCULATION

Base formula:
```
ELO_delta = K * (actual_score - expected_score)
```

Where:
- K = 32 (base), 48 (new players, <10 games), 24 (veterans, >50 games)
- actual_score = combined_score (as above, scaled 0.0-1.0)
- expected_score = 1 / (1 + 10^((opponent_ELO - player_ELO) / 400))

### Rank Thresholds

| Rank | Min ELO |
|---|---|
| Iron | 0 |
| Bronze | 500 |
| Silver | 1000 |
| Gold | 1500 |
| Platinum | 2000 |
| Diamond | 2500 |
| Master | 3000 |
| Apex | 3500 |

---

## SKILL SCORING MATRIX

Each level tests specific skills. Scores are normalized 0-100.

| Level | Observation | Prompt Eng | Reasoning | Verification | Research | Adaptability | Communication | Collaboration | Competitive |
|---|---|---|---|---|---|---|---|---|---|
| Tutorial | 40 | 20 | 10 | 10 | 5 | 5 | 5 | 0 | 5 |
| Level 1 | 30 | 35 | 15 | 10 | 5 | 5 | 0 | 0 | 0 |
| Level 2 | 10 | 0 | 35 | 25 | 5 | 10 | 5 | 5 | 5 |
| Level 3 | 10 | 5 | 10 | 30 | 30 | 5 | 5 | 0 | 5 |
| Level 4 | 5 | 5 | 20 | 25 | 30 | 5 | 5 | 5 | 0 |
| Level 5 | 5 | 0 | 20 | 20 | 10 | 10 | 25 | 5 | 5 |
| Final | 10 | 10 | 20 | 20 | 15 | 10 | 5 | 0 | 10 |

**Post-game calculation:**
1. Per-level score is assigned based on completion quality
2. Skill scores are weighted averages across levels
3. Each skill is reported as percentage

---

## END OF ANSWER KEY
