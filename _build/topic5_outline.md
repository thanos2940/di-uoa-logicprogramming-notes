# Chapter 5 Outline: Advanced Programming

## 1. Input/Output (I/O) in Prolog
- **Concepts**: Prolog provides built-in predicates for interacting with the user and files.
- **Output Predicates**:
  - `write(Term)`: Writes a term to the current output stream.
  - `nl`: Writes a new line character.
  - `display(Term)`: Writes a term in prefix notation (ignoring operators).
  - `put(Char)`: Writes a single character (given its ASCII code).
- **Input Predicates**:
  - `read(Term)`: Reads a term from the current input stream (must end with a period `.`).
  - `get(Char)`: Reads the next non-blank character.
  - `get0(Char)`: Reads the next character (including blanks).
- **File Handling**:
  - `see(File)`: Sets the current input stream to a file.
  - `seen`: Closes the current input file and reverts to keyboard input.
  - `tell(File)`: Sets the current output stream to a file.
  - `told`: Closes the current output file and reverts to the screen.

## 2. Dynamic Database (Modifying the Program at Runtime)
- **Concepts**: Programs can modify themselves by adding or removing clauses dynamically.
- **Adding Clauses**:
  - `assert(Clause)`: Adds a clause to the database.
  - `asserta(Clause)`: Adds a clause at the beginning of the predicate's definition.
  - `assertz(Clause)`: Adds a clause at the end of the predicate's definition.
- **Removing Clauses**:
  - `retract(Clause)`: Removes the first clause that unifies with the argument.
  - `retractall(Head)`: Removes all clauses whose head unifies with the argument.
  - `abolish(Name, Arity)`: Removes all clauses for a specific predicate.
- **Uses**: Storing state, memoization (caching results), global flags.

## 3. Sorting and Set Predicates
- **Concepts**: Prolog provides efficient built-in sorting mechanisms.
- **Standard Sorting**:
  - `sort(List, SortedList)`: Sorts a list and removes duplicates (standard order of terms).
  - `msort(List, SortedList)`: Sorts a list but preserves duplicates.
- **Key Sorting**:
  - `keysort(KeyedList, SortedList)`: Sorts a list of `Key-Value` pairs based on the keys. Preserves relative order of items with the same key (stable sort).
- **Set Operations**:
  - `setof(Template, Goal, Set)`: Finds all instances of `Template` satisfying `Goal` and returns them as a sorted list with no duplicates.
  - `bagof(Template, Goal, List)`: Finds all instances but preserves duplicates and does not sort.
  - `findall(Template, Goal, List)`: Similar to `bagof` but handles unbound variables differently (returns an empty list if no solutions are found).

---

## Fidelity Checklist & Mandatory Items
- [ ] List and explain core I/O predicates (`write`, `read`, `nl`, `put`, `get0`).
- [ ] Explain file handling via `see`/`seen` and `tell`/`told`.
- [ ] Define the behavior of `asserta`, `assertz`, and `retract`.
- [ ] Differentiate between `sort` (unique) and `msort` (duplicates).
- [ ] Explain `keysort` and its stability.
- [ ] Compare `findall`, `bagof`, and `setof` with examples.
- [ ] Warning: Dynamic predicates often require a `:- dynamic name/arity.` declaration in many modern Prologs (like SWI).
