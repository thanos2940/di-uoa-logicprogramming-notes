# Chapter 4 Outline: Logic Theory, Semantics, and Constraints

## 1. Theoretical Background: First-Order Logic
- **Foundations**: Logic programming is based on First-Order Predicate Logic.
- **Alphabets & Sets**:
  - `P`: Set of predicates.
  - `F`: Set of function symbols.
  - `V`: Set of variables.
  - **Arity**: The number of arguments a predicate or function takes (e.g., `n >= 0`). Arity 0 functions are constants.
- **Terms & Atoms**:
  - A **Term** is a variable, a constant, or a function applied to terms.
  - An **Atomic Formula (Atom)** is a predicate applied to terms.
- **Formulas & Connectives**:
  - Connectives: `¬` (negation), `∧` (conjunction), `∨` (disjunction), `→` (implication), `↔` (equivalence).
  - Quantifiers: `∀` (universal), `∃` (existential).
  - **Well-formed formulas**: Constructed recursively from atoms, connectives, and quantifiers.

## 2. Clauses and Horn Clauses
- **Clauses**: Formulas of the form `∀x1...∀xn (L1 ∨ L2 ∨ ... ∨ Lm)` where `Li` are literals (atoms or negated atoms).
- **Definite Clauses**: Clauses with exactly one positive literal (e.g., `A ← B1 ∧ ... ∧ Bn`). This is the basis of Prolog rules!
- **Unit Clauses**: Definite clauses with no negative literals (`A ← `), representing Prolog facts.
- **Definite Goals**: Clauses with zero positive literals (`← B1 ∧ ... ∧ Bn`), representing Prolog queries.
- **Empty Clause**: Represents a contradiction (`□`).
- **Horn Clauses**: Clauses with *at most* one positive literal (Definite clauses + Definite goals).

## 3. Syntax vs. Semantics
- **Syntax**: How programs are written (the theory covered above).
- **Semantics**: The meaning of the logic programs. There are three equivalent approaches to defining the semantics of definite programs:
  1. **Model-Theoretic Semantics**
  2. **Fixpoint Semantics**
  3. **Operational Semantics**

## 4. Model-Theoretic Semantics
- **Herbrand Universe & Base**:
  - **Herbrand Universe (`UL`)**: Set of all ground (variable-free) terms.
  - **Herbrand Base (`BL`)**: Set of all ground atoms formed from predicates in `P` and terms in `UL`.
- **Herbrand Interpretation**: A subset of the Herbrand Base. Defines which ground atoms are considered "true".
- **Models**: An interpretation is a model for a program if every clause in the program is true under this interpretation.
- **Least Herbrand Model (`Mp`)**: The intersection of all Herbrand models of a program. It contains exactly all the logical consequences of the program.

## 5. Fixpoint Semantics
- **Concept**: A constructive method to compute the Least Herbrand Model.
- **The Tp Operator**: A continuous mapping from interpretations to interpretations. `Tp(I)` generates all facts that can be deduced in one step using the program's rules and the facts currently in `I`.
- **Least Fixpoint (`lfp`)**: Applying `Tp` repeatedly starting from the empty set `∅` eventually reaches a state where no new facts can be deduced. This fixpoint `lfp(Tp)` is exactly the Least Herbrand Model `Mp`.

## 6. Operational Semantics (SLD-Resolution)
- **Concept**: How the computer actually infers new knowledge (inference rules).
- **Unification (mgu)**: Substitutions map variables to terms. The Most General Unifier (mgu) finds the simplest substitution to make two terms identical.
- **SLD-Resolution**: The inference rule used in Prolog. Given a goal `← A1, ..., Ak` and a rule `A ← B1, ..., Bq`, if `A1` and `A` unify with substitution `θ`, the new goal becomes `← (B1, ..., Bq, A2, ..., Ak)θ`.
- **SLD-Refutation**: A sequence of resolution steps that ends in the empty clause (contradiction), proving the original goal.
- **Success Set (`SS(P)`)**: The set of all ground atoms that have an SLD-refutation. Crucially, `Mp = lfp(Tp) = SS(P)`.

## 7. Constraint Logic Programming (CLP)
- **Problem**: The standard "generate-and-test" approach in logic programming is very slow for large combinatorial search problems.
- **Solution**: "Constrain-and-generate". We declare constraints upfront, which actively prune the search space before and during the generation of values.
- **ECLiPSe Prolog**: A dialect supporting CLP. Variables can have finite domains (e.g., `Solution :: 1..N`).
- **Applications**: Scheduling, timetabling, routing, operations research.

---

## Fidelity Checklist & Mandatory Items
- [ ] Definitions of Term, Atomic Formula, and Well-Formed Formula.
- [ ] Clauses, Definite Clauses, and Horn Clauses mapping to Prolog syntax.
- [ ] Herbrand Universe (`UL`) and Herbrand Base (`BL`) definitions.
- [ ] Least Herbrand Model (`Mp`) concept.
- [ ] Fixpoint Semantics and the `Tp` Operator.
- [ ] Operational Semantics: Substitution, Unification (mgu), and SLD-Resolution.
- [ ] The Fundamental Theorem: `Mp = lfp(Tp) = SS(P)`.
- [ ] Constraint Logic Programming: Generate-and-Test vs. Constrain-and-Generate.
- [ ] Example syntax of ECLiPSe finite domains (`Var :: 1..N`).