---
name: xppai-init
description: Use when working with any X++ AX 2009 code, analysis, review, or fix task — loads foundational AX 2009 and X++ knowledge required by all xppai skills.
---

# XppAI Init — AX 2009 & X++ Foundational Knowledge

## Scope

BASE layer + REAL WORK layer. No D365, no cloud, no modern AX. AX 2009 and X++ as used in real production projects.

---

## 1. AX 2009 Core Architecture

### Application Object Tree (AOT)
The AOT is the central repository for all application objects. Everything — tables, classes, forms, queries, enums, EDTs, jobs — lives in the AOT. Customizations are layered on top of standard objects using the layer system (SYS → GLS → ISP → ISV → VAR → CUS → USR). Higher layers override lower layers per method.

### Key Object Types

| Object | Role | Where code lives |
|--------|------|-----------------|
| **Table** | Data structure + business logic close to data | Table methods: `find`, `exist`, `insert`, `update`, `delete`, `validateWrite`, `modifiedField`, `initValue` |
| **Class** | Reusable logic, services, helpers, RunBase jobs | Methods on the class; `new`, `run`, `main`, `construct` |
| **Form** | UI layer — displays and interacts with data | Form methods + datasource methods + control methods |
| **Query** | Reusable query definitions | Used by forms, reports, classes |
| **Enum** | Fixed value sets (e.g. `NoYes`, `PurchStatus`) | Referenced in conditions and field types |
| **EDT** | Extended Data Type — typed field definitions with labels, relations | Used as field types on tables and method signatures |
| **Map** | Abstract field mapping across multiple tables | Allows shared method logic across tables with same field structure |
| **View** | Read-only SQL view defined in AOT | Used for reporting and display datasources |

### MorphX
The AX 2009 IDE. Code is written and compiled inside MorphX. All objects are stored as metadata in the AOT, not as flat files. `.xpo` files are export snapshots of AOT objects.

---

## 2. X++ Language Fundamentals

### Syntax Basics
```xpp
// Variable declarations at TOP of method — always, no exceptions in AX 2009
void myMethod()
{
    SalesTable  salesTable;
    int         counter;
    boolean     found;
    ;  // semicolon separator between declarations and statements (AX 2009 style)

    // code here
}
```

### Common Patterns

**find() — standard table lookup**
```xpp
// Returns one record by primary key. Static method on the table.
salesTable = SalesTable::find(salesId);
salesTable = SalesTable::find(salesId, true);  // true = forupdate
```

**exist() — boolean check without fetching full record**
```xpp
if (SalesTable::exist(salesId))
{
    // ...
}
```

**while select — standard iteration**
```xpp
while select salesLine
    where salesLine.SalesId == salesTable.SalesId
{
    // process salesLine
}
```

**display method — computed field shown on form, not stored**
```xpp
// On the table, used as a datasource field on forms
display Amount totalAmount()
{
    return this.SalesQty * this.SalesPrice;
}
```

**modifiedField — fires when a field changes on a form**
```xpp
// On the table — called by the form datasource
public void modifiedField(FieldId _fieldId)
{
    switch (_fieldId)
    {
        case fieldNum(SalesLine, ItemId):
            this.initFromInventTable(InventTable::find(this.ItemId));
            break;
    }
    super(_fieldId);
}
```

**validateWrite — called before insert/update**
```xpp
public boolean validateWrite()
{
    boolean ret = super();
    if (!this.ItemId)
        ret = checkFailed("Item is required");
    return ret;
}
```

---

## 3. Form Lifecycle and Interaction Model

### Form Method Execution Order
```
form.init()          → sets up datasources, queries, controls
form.run()           → executes query, renders UI
datasource.active()  → fires when current record changes (navigation, filter)
control.modified()   → fires when a field value changes in the UI
datasource.write()   → fires on save (calls table.validateWrite + insert/update)
```

### Key Datasource Methods

| Method | When it fires | Typical use |
|--------|--------------|-------------|
| `init()` | Once on form open | Set up query ranges, field visibility, caching |
| `executeQuery()` | On query run/re-run | Rarely overridden; use `research()` to re-run |
| `active()` | On every record navigation | Update field states, button enables, dependent UI |
| `refresh()` | UI repaint — no reread | Use when buffer already updated |
| `reread()` | Re-fetches current record from DB | Use after external update |
| `research()` | Re-runs query, returns to current record | Use after data change affecting query |
| `write()` | Before save | Rarely overridden on form; prefer table methods |

### Where Business Logic Lives

| Logic type | Correct location |
|-----------|-----------------|
| Field defaulting | `table.initValue()`, `table.modifiedField()` |
| Validation | `table.validateWrite()`, `table.validateField()` |
| Calculations | Table methods or separate class |
| UI state (enable/disable) | Form `active()` or form-level methods |
| Complex processes | RunBase class or service class |

**Do NOT put business logic in form control `modified()` methods** — it will not run in non-UI contexts (batch, integration).

---

## 4. Data Access Patterns

### select statement structure
```xpp
// Basic
select firstOnly salesTable
    where salesTable.SalesId == 'SO-001';

// With index hint (performance)
select firstOnly salesTable
    index hint SalesIdx
    where salesTable.SalesId == 'SO-001';

// forupdate — required before modifying
select forupdate salesTable
    where salesTable.SalesId == 'SO-001';

// join
select salesLine
    join salesTable
        where salesTable.SalesId == salesLine.SalesId
           && salesTable.CustAccount == 'C-001';

// count
select count(RecId) from salesLine
    where salesLine.SalesId == salesTable.SalesId;
// result is in salesLine.RecId (AX 2009 aggregate behavior)
```

### Transaction scope
```xpp
ttsBegin;
// select forupdate + modify within this scope
salesTable.SalesName = 'Updated';
salesTable.update();
ttsCommit;
```

### RecordInsertList — bulk insert
```xpp
RecordInsertList ril = new RecordInsertList(tableNum(SalesLine));
// add records in loop
ril.add(salesLine);
// single DB operation
ril.insertDatabase();
```

---

---

## 5. Deep Data Access — Real Work Patterns

### select keyword reference

| Keyword | Effect |
|---------|--------|
| `firstOnly` | Returns at most one record — stops after first match |
| `firstFast` | Hint: client starts processing before full result set arrives — use only when iterating, not when total count matters |
| `forupdate` | Acquires update lock on fetched records — required before `.update()` or `.delete()` |
| `exists join` | Returns left-side records that have a matching right-side record — no right-side fields available |
| `notexists join` | Returns left-side records with NO matching right-side record |
| `outer join` | Returns all left-side records; right-side fields are blank if no match |
| `group by` | Aggregates — use with `sum()`, `count()`, `avg()`, `min()`, `max()` |
| `order by` | Sort — `asc` (default) or `desc` |
| `index hint` | Forces a specific index — critical for performance when default optimizer choice is wrong |
| `nofetch` | Declares cursor without fetching — combined with `next` to iterate manually |

```xpp
// exists join — find purchLines that have at least one receipt
while select purchLine
    exists join inventTrans
        where inventTrans.InventTransId == purchLine.InventTransId
{
    // process purchLine
}

// notexists join — find orders with no lines
while select purchTable
    notexists join purchLine
        where purchLine.PurchId == purchTable.PurchId
{
    // purchTable has no lines
}

// group by + sum
select sum(LineAmount) from salesLine
    where salesLine.SalesId == salesTable.SalesId;
// result in salesLine.LineAmount

// nofetch + next (manual cursor)
select nofetch forupdate salesLine
    where salesLine.SalesId == salesTable.SalesId;
while (salesLine)
{
    salesLine.SalesStatus = SalesStatus::Invoiced;
    salesLine.update();
    next salesLine;
}
```

### Costly access patterns to detect

| Pattern | Why it's expensive | Fix |
|---------|--------------------|-----|
| `find()` inside `while select` loop | O(n) reads — one per iteration | Cache before loop if key doesn't change |
| `select` with header-level filter inside line loop | Loop-invariant query | Move before loop |
| `select` without `firstOnly` when one record expected | Fetches full result set | Add `firstOnly` |
| `select *` with no index hint on large table | Full table scan risk | Add `index hint` |
| Repeated `find()` on same key in same method | Redundant reads | Store in local variable |
| `display` method calling `find()` per row | Called per visible row on form | Cache or restructure |

---

## 6. Transactions and Data Integrity

### Transaction keywords

```xpp
ttsBegin;       // opens transaction (or increments nesting level)
ttsCommit;      // commits if at level 1; decrements level if nested
ttsAbort;       // rolls back ALL levels immediately — no partial commit possible
```

### ttsLevel — nesting behavior

`ttsLevel` (system variable) returns the current nesting depth. AX 2009 supports nested `ttsBegin` blocks but only the outermost `ttsCommit` performs the actual commit. `ttsAbort` at any level rolls back everything.

```xpp
ttsBegin;           // ttsLevel = 1
    ttsBegin;       // ttsLevel = 2
    ttsCommit;      // ttsLevel back to 1 — NOT committed yet
ttsCommit;          // ttsLevel = 0 — actual DB commit happens here
```

### Risky transaction patterns

| Pattern | Risk |
|---------|------|
| `ttsBegin` far from `ttsCommit` | Wide lock scope — blocks other users |
| `ttsAbort` after partial work | Full rollback — caller may not expect it |
| `insert/update` outside `ttsBegin` | AX 2009 auto-wraps in implicit transaction — side effects may commit separately |
| Calling external methods inside `tts` | Hidden commits or aborts inside the called method |
| `error()` or `throw` inside `tts` without abort | Transaction left open — must always `ttsAbort` before throwing |

### Table method execution order on save

```
validateWrite()     → must return true or save is blocked
write() (form ds)   → calls insert() or update() on table
insert() / update() → fires table-level insert/update logic
modifiedField()     → fires during UI field change, before save
```

---

## 7. Performance Behavior in AX 2009

### Client vs Server execution

AX 2009 is a two-tier architecture: **AOS (server)** and **client**. Every method runs on one side. Crossing the boundary has cost.

| RunOn setting | Effect |
|--------------|--------|
| `Server` | Runs on AOS — correct for data access and business logic |
| `Client` | Runs on client — correct for UI-only logic |
| `Called from` | Runs wherever the caller runs — can cause unintended client execution |

**Crossing the boundary per iteration is the most common hidden cost** — a method marked `Client` called inside a server-side loop causes a network round-trip per call.

### Hot path signals

- `active()` on a form datasource — fires on every record navigation
- `display` methods — re-execute for every visible row on every refresh
- `refresh()` or `reread()` inside a loop — multiplies DB reads
- `new ClassName()` inside a loop — object construction cost per iteration
- `find()` inside `while select` — read per row

### Realistic bottleneck sources

| Source | Symptom |
|--------|---------|
| Tax/totals recalc per line | Posting slow on orders with many lines |
| `FormDataSource.refresh()` inside update | UI freeze when saving multi-line order |
| Constructor + calc called per line | Profiler shows same constructor 100× |
| `display` method with DB access | Form scroll is slow |
| Wide `ttsBegin` scope with many updates | Blocking and timeout under concurrent use |

---

## 8. Debugging and Troubleshooting

### Reading a stack trace

1. Start from the **top** — that is where execution is at the moment of failure
2. Walk **down** to find where control entered the expensive or broken path
3. Identify the **first avoidable call** — where the redundant or broken work begins
4. Identify the **loop** that calls it — the loop is usually the root cause, not the leaf method

### Profiler output interpretation

- **Call count** is more important than duration alone — a 1ms method called 50,000 times = 50s
- Look for the same method appearing many times in the dominant path
- Constructors appearing per-record in a posting flow = confirmed structural problem
- `find()` or `select` appearing inside a loop with a fixed key = loop-invariant query

### Distinguishing symptom from root cause

| Symptom | Likely root cause |
|---------|------------------|
| Posting takes 10 minutes | Tax/totals recalc per line, not per order |
| Form navigation is slow | `active()` doing DB work per record |
| Form scroll is slow | `display` method doing `find()` per row |
| Deadlock on concurrent posting | Wide `ttsBegin` scope or missing `firstOnly` |
| Infolog flood during import | Validation or warning inside loop, no batch guard |

### Investigation order

1. Identify the **dominant path** from profiler (highest call count × duration)
2. Find the **loop** driving that path
3. Determine if the work inside is **per-record necessary** or **loop-invariant**
4. Check if the method is running on **client or server** — boundary crossing adds latency
5. Check **transaction scope** — is `ttsBegin` wider than needed?

---

---

## 9. Totals, Taxes, and Pricing Flows

### Line-level vs total-level calculation

| Level | What it covers | Triggered by |
|-------|---------------|--------------|
| **Line-level** | Unit price, line amount, line discount, line tax | `modifiedField` on ItemId, Qty, Price; line write |
| **Total-level** | Sum of lines, header charges, total tax, net amount | `PurchTotals`/`SalesTotals` recalc; posting flow |

Line-level recalc is cheap. Total-level recalc reads all lines and recomputes everything — calling it per line inside a loop is a confirmed performance anti-pattern.

### PurchTotals / SalesTotals

```xpp
// Instantiated with a header record — recalculates all totals on demand
purchTotals = PurchTotals::newPurchTable(purchTable);
purchTotals.calc();
// Access results via purchTotals.purchTotalTaxAmount(), .purchTotalAmount(), etc.
```

- `calc()` reads all `PurchLine` records for the order and recomputes everything
- Calling inside a per-line loop = O(n²) — every line triggers a full re-read of all lines
- **Safe pattern:** call `calc()` once after all lines are processed

### Tax cascade in AX 2009

```
field change (e.g. TaxGroup)
  → modifiedField on table
    → Tax::newTrans() or TaxPurch::newTrans()  ← constructor per trigger
      → Tax::calc()                             ← reads TaxTable, applies rates
        → updates TaxAmount on line
          → triggers totals recalc             ← re-reads all lines
```

One field change can trigger: constructor + calc + totals recalc + currency conversion. If called inside a loop, this cascade multiplies per iteration.

### Markup and charges

- `MarkupTable` / `MarkupTrans` — charges applied at header or line level
- Markup is included in totals recalc — modifying charges without recalculating totals leaves the form showing stale values
- `initCursorMarkup()` is called per line in posting flows — expensive if markup exists on every line

### Common misplacement patterns

| Problem | Where it appears | Why it's wrong |
|---------|-----------------|----------------|
| `calcTax()` called per line in posting loop | Class posting method | Should be called once after all lines written |
| `PurchTotals.calc()` in `active()` | Form datasource | Recalculates all lines on every navigation |
| Tax constructor inside `while select` | Import or migration class | O(n) constructor + calc cost |

---

## 10. AX 2009 Framework Patterns

### RunBase — standard job pattern

```xpp
class MyJob extends RunBase
{
    // pack/unpack for dialog persistence
    public container pack()   { return conNull(); }
    public boolean unpack(container _pack) { return true; }

    // construct — always use instead of new()
    public static MyJob construct() { return new MyJob(); }

    // main — entry point from menu item
    public static void main(Args _args)
    {
        MyJob job = MyJob::construct();
        if (job.prompt())   // shows dialog
            job.run();
    }

    public void run()
    {
        // actual work here
    }
}
```

`RunBaseBatch` extends `RunBase` — adds batch scheduling. Structure is identical; override `runsImpersonated()` and batch-related methods.

### SalesFormLetter / PurchFormLetter — posting framework

The `FormLetter` classes manage the full document posting flow: validation → picking/packing → journal creation → tax → inventory → voucher.

```
PurchFormLetter::construct(DocumentStatus::Invoice)
  → PurchFormLetter_Invoice
    → run()
      → PurchParmTable / PurchParmLine population
        → PurchCalcTax_Invoice (tax per line)
          → InventMovement (inventory)
            → Ledger posting
```

**Key constraint:** never insert custom logic directly into `FormLetter.run()` — override specific hook methods or use pre/post patterns to avoid breaking the framework sequence.

### Query / QueryRun

```xpp
Query           q   = new Query(queryStr(PurchTable));
QueryRun        qr  = new QueryRun(q);

// Add range programmatically
q.dataSourceTable(tableNum(PurchTable))
 .addRange(fieldNum(PurchTable, PurchStatus))
 .value(queryValue(PurchStatus::Backorder));

while (qr.next())
{
    purchTable = qr.get(tableNum(PurchTable));
    // process
}
```

### NumberSeq — number sequence allocation

```xpp
// Never call directly — use the table's number sequence reference
purchTable.PurchId = NumberSeq::newGetNum(PurchParameters::numRefPurchId()).num();
```

Allocating outside a `ttsBegin` scope can cause gaps. Allocating inside a loop wastes sequence numbers on rollback.

### InventDim — inventory dimension framework

```xpp
// Never construct manually — always use findOrCreate
inventDim.InventSiteId    = 'SITE1';
inventDim.InventLocationId = 'WH01';
inventDim.inventSerialId  = serialId;
inventDim = InventDim::findOrCreate(inventDim);
// use inventDim.inventDimId on the line
```

`InventDim` is a shared dimension table — each unique combination of dimension values has one record. `findOrCreate` ensures no duplicates. Writing a new `InventDim` directly is wrong and breaks dimension integrity.

---

## 11. Safe Customization Practices in Legacy ERP

### Minimal diff principle

- Propose the smallest change that fixes the confirmed problem
- Do not refactor surrounding code unless it is directly causing the issue
- Preserve existing method signatures — callers are unknown
- Never remove a method call without verifying all callers

### High-regression areas

| Area | Why it's risky |
|------|---------------|
| `modifiedField` on core tables (`SalesLine`, `PurchLine`) | Called from many paths — UI, posting, integration |
| `validateWrite` | Blocks all saves if it returns false unexpectedly |
| `FormLetter.run()` sequence | Any ordering change breaks posting |
| `initFrom*` chains | Field overwrite order is sensitive — last call wins |
| `active()` on major forms | Fires constantly — side effects multiply |

### Fragile customization signals

- Logic placed in form `modified()` instead of table `modifiedField()` — won't run in batch
- Hardcoded `DataAreaId` or company — breaks multi-company
- `ttsAbort` inside a helper method called mid-transaction — surprise rollback for caller
- `select forupdate` without a following `update()` or `delete()` — unnecessary lock
- `info()` / `warning()` inside a batch loop — floods infolog, no user sees it

---

## 12. Architectural Judgment in AX 2009

### Layer placement heuristic

| Logic type | Should live in |
|-----------|---------------|
| Field defaulting, validation | Table |
| Complex calculation, totals | Separate class |
| UI state, control visibility | Form (active/init) |
| Document posting, workflow | FormLetter or RunBase |
| Integration, import/export | RunBase or service class |

### Coupling and boundary signals

- Form method calling `SalesTable::find()` when it already holds the buffer → unnecessary coupling to DB
- Table method calling `element.refresh()` → table knows about form — wrong direction
- Class method reading from `Global` or form-level variables → hidden dependency
- Two classes sharing logic via copy-paste → duplication debt

### Improvement path order

1. Fix confirmed correctness issues first (wrong behavior)
2. Fix confirmed performance issues with minimal change (move query, cache result)
3. Propose structural improvements as optional — estimate regression risk
4. Only recommend full redesign when incremental fixes cannot contain the problem

---

## Rules for All XppAI Skills

- Never recommend changes to localization blocks: `<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>`
- Stay grounded in AX 2009 — no D365, no modern X++ features
- Variable declarations always at top of method
- Prefer evidence from code over assumptions
- `TextIo` has no `.eof()` — use `IO_Status::Ok` after `read()`
- `select count(RecId)` stores result in the `RecId` field of the buffer
