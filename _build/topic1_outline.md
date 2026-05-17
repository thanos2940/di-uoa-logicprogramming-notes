# Chapter 1 Outline: Introduction to Logic Programming & Prolog Basics

## 1. Introduction to Logic Programming
- **Concept**: Programming in Logic (PROLOG = PROgramming in LOGic).
- **Logical Foundations**: Based on First-Order Predicate Logic.
- **Declarative Approach**: Focus on "what" the problem is rather than "how" to solve it (procedural).
- **Example**: 
    - Logic: "Every man is mortal. Socrates is a man. Therefore, Socrates is mortal."
    - Prolog: `fallible(X) :- man(X). man(socrates).`
    - Query: `?- fallible(socrates).` -> `yes`.

## 2. Basic Prolog Syntax
- **Alphabet**: 
    - Upper case `A..Z` and underscore `_` for **Variables**.
    - Lower case `a..z` for **Atoms** (unless quoted).
    - Digits `0..9` for **Numbers**.
    - Special characters for operators and punctuation.
- **Atoms**: Constant symbolic names (e.g., `anna`, `x25`, `'Tom'`).
- **Numbers**: Integers and floats (e.g., `1313`, `3.14`).
- **Variables**: Placeholders for terms (e.g., `X`, `Result`, `_anonymous`).
- **Structures (Complex Terms)**: 
    - Consist of a **functor** and **arguments** (arity = number of arguments).
    - Example: `date(1, may, 1983)` (functor: `date`, arity: 3).
    - Recursive nesting: `triangle(point(1,1), point(2,3), point(4,2))`.

## 3. The Prolog Program: Facts and Rules
- **Clauses**: The building blocks of a program.
- **Facts**: Unconditional truths. 
    - Syntax: `predicate(arg1, ..., argN).`
    - Example: `parent(pam, bob).`, `female(pam).`.
- **Rules**: Conditional truths (If-Then).
    - Syntax: `Head :- Body.` (Head is true if Body is true).
    - Body can be a conjunction (comma `,` = AND) or disjunction (semicolon `;` = OR).
    - Example: `mother(X, Y) :- parent(X, Y), female(X).`
- **Questions (Queries)**: Interaction with the program.
    - Syntax: `?- goal1, goal2, ...`.
    - Results: `yes` (success), `no` (failure), or variable instantiations.

## 4. Recursion in Prolog
- **Definition**: A rule that refers to itself.
- **Structure**: Always requires a **Base Case** (terminating) and a **Recursive Case**.
- **Example: Predecessor (Ancestor)**:
    - Base: `predecessor(X, Z) :- parent(X, Z).`
    - Recursive: `predecessor(X, Z) :- parent(X, Y), predecessor(Y, Z).`
- **Importance**: Essential for processing hierarchical or list data.

## 5. Unification (Matching)
- **Concept**: The process of making two terms identical by assigning values to variables.
- **Rules of Unification**:
    - Identical atoms/numbers unify.
    - A variable unifies with anything (and becomes instantiated).
    - Structures unify if they have the same functor/arity and their corresponding arguments unify.
- **Examples**:
    - `date(D, M, 1983) = date(D1, may, Y1)` -> `D=D1`, `M=may`, `Y1=1983`.
    - `point(X, Y) = point(1, 2)` -> `X=1`, `Y=2`.

## 6. Procedural Meaning and Execution
- **Resolution**: The inference engine used by Prolog.
- **Backtracking**: When a goal fails, Prolog "goes back" to the last choice point to try another clause.
- **AND-OR Tree (Resolution Tree)**: Visual representation of the search space.
- **Declarative vs. Procedural Meaning**:
    - Declarative: What is logically true.
    - Procedural: How Prolog searches for a solution.
- **Rule and Goal Ordering**:
    - Order matters for efficiency and termination.
    - Rule of thumb: "Try simpler/base cases first."
    - Infinite loops: `p :- p.` or left-recursion without proper base cases.

---

## Fidelity Checklist & Mandatory Items
- [x] Definitions of: atom, variable, structure, functor, arity.
- [x] Comparison of logic notation vs Prolog notation (Socrates example).
- [x] The `parent` / `predecessor` family tree example.
- [x] Unification examples (date, point, triangle).
- [x] Representation of geometric shapes and circuits (seq/par).
- [x] Disjunction syntax (`;`) vs multiple clauses.
- [x] Procedural meaning steps (backtracking).
- [x] Rule/Goal order variations (`pred1` to `pred4` examples).
- [x] Monkey and Banana state representation (briefly).
