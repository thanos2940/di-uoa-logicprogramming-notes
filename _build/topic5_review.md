# Review Report — Chapter 5 (Advanced Programming)

## Coverage stats
- I/O Predicates: 8/8 ✅
- File Handling: 4/4 ✅
- Dynamic DB Predicates: 4/6 ⚠️ (Missing `findall` implementation example)
- Sorting Algorithms: 2/6 ❌ (Missing `bubblesort`, `insertsort` explicit listings)
- Set Predicates: 3/3 ✅

## Missing items

### 1. Interactive `cube` example (Slide ~82)
Source uses a `cube :- read(X), process(X).` loop to demonstrate interactive I/O.
**Action:** Add to §1.

### 2. `findall/3` implementation using Dynamic DB (Slide ~97)
Source shows a very important conceptual example of implementing `findall` using `assert` and `retract` (using a queue).
**Action:** Add to §2 as a "How it works" highlight.

### 3. Towers of Hanoi example (Slide ~98)
Used to demonstrate `write` side-effects in a recursive context.
**Action:** Add to §1.

### 4. Explicit Sorting Algorithms (Slides ~110-113)
The source explicitly lists `bubblesort` and `insertsort`. The current HTML only mentions built-in `sort/2`.
**Action:** Add these listings to §3.

### 5. Empty Result Comparison (Slide ~96)
Source explicitly shows that `findall` succeeds with `[]` on failure, while `bagof` and `setof` fail (`no`).
**Action:** Highlight this in the comparison table in §3.

## Items present but too terse

### 6. §1 — `display/1`
Source notes it ignores operators and uses prefix notation.
**Action:** Add example `display(2+3)` -> `+(2,3)`.

## All-clear items
- File handling predicates ✅
- Dynamic DB core (`assert`, `retract`) ✅
- Keysort stability ✅
