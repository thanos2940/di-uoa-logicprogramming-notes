# Chapter 2 Outline: Lists, Operators, Arithmetic, and Cut

## 1. Lists in Prolog
- **Concept**: Used to represent ordered sequences of items.
- **Representation**:
  - The empty list is `[]`.
  - A non-empty list is a structure with the functor `.` and two arguments: the Head and the Tail. (e.g., `.(Head, Tail)`).
  - Standard bracket notation: `[Head | Tail]`.
- **Equivalence**: `.(a, .(b, .(c, [])))` is equivalent to `[a, b, c]`.

## 2. Basic List Operations
- **`member/2`**: Checks if an element is in a list.
  - Base: `member(X, [X|Tail]).`
  - Recursive: `member(X, [Head|Tail]) :- member(X, Tail).`
- **`append/3`**: Concatenates two lists to form a third.
  - Extremely versatile: can be used to join lists, or run backwards to split a list.
- **`del/3` & `insert/3`**: Removing or adding elements.
- **`sublist/2`**: Finding contiguous sub-sequences.
- **`permutation/2` & `reverse/2`**:
  - `reverse` can be implemented naively (O(n^2)) or optimized using accumulators (O(n)).

## 3. Operators in Prolog
- **Syntax Sugar**: Operators don't evaluate anything by themselves; they just provide a cleaner syntax for structures. (e.g., `2+3` is just `+(2,3)`).
- **Definition**: `:- op(Precedence, Type, Name).`
- **Precedence**: A number (e.g., 1 to 1200). The higher the number, the looser the binding (lower priority).
- **Types**:
  - Infix: `xfx` (non-associative), `xfy` (right-associative), `yfx` (left-associative).
  - Prefix: `fx`, `fy`.
  - Postfix: `xf`, `yf`.

## 4. Arithmetic
- **Evaluation**: Prolog does not evaluate math expressions automatically. You must use the `is` operator.
  - Example: `X is 1 + 2.` (Result: `X = 3`).
- **Comparison Operators**:
  - Evaluated: `>`, `<`, `>=`, `=<`, `=:=` (equal), `=\=` (not equal).
- **Example**: `length/2` calculating list length using `N is 1 + N1`.

## 5. Control Flow: The Cut Operator (`!`)
- **Purpose**: Prunes the search space. Prevents Prolog from backtracking to search for alternative solutions once a certain point is reached.
- **Mechanics**:
  - Succeeds immediately on the forward pass.
  - On backtracking, it fails the parent goal, cutting off any remaining clauses for that predicate.
- **Example**: `max(X, Y, Max)`
  - With cut: `max(X, Y, X) :- X >= Y, !.` \n `max(X, Y, Y).`
- **Classification**:
  - **Green Cut**: Does not change the declarative meaning (only improves performance).
  - **Red Cut**: Changes the declarative meaning (removing it changes the program's output). Requires caution.

## 6. Negation as Failure (`not`)
- **Definition**: Implemented using cut and fail.
  - `not(Goal) :- call(Goal), !, fail.`
  - `not(Goal) :- true.`
- **Closed World Assumption**: Prolog assumes that anything it cannot prove to be true must be false.

---

## Fidelity Checklist & Mandatory Items
- [x] Representation of lists: `[]`, `[Head|Tail]`, `.(Head, Tail)`.
- [x] Implementations of `member/2` and `append/3`.
- [x] `reverse/2` with and without an accumulator.
- [x] Operator definition syntax: `:- op(Precedence, Type, Name)`.
- [x] Explanation of associativity (`xfx`, `yfx`, `xfy`).
- [x] Arithmetic evaluation using `is` vs unification `=`.
- [x] Relational math operators (`=:=`, `=\=`, `=<`, etc.).
- [x] The Cut `!` operator mechanics and `max/3` example.
- [x] Green vs Red cuts definition.
- [x] Negation as Failure (`not/1` using `!, fail`).
