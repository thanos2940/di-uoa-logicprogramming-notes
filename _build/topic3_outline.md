# Chapter 3 Outline: Trees, Graphs, and State Space Search

## 1. Binary Trees
- **Concept**: Another way to organize collections of items, often more efficient than lists.
- **Structure**: A binary tree is either empty (`nil`), or a root node with a left sub-tree and a right sub-tree.
- **Prolog Representation**:
  - `t(Left, Root, Right)` where `t` is the functor.
  - Empty tree: `nil`.
- **Example**: `t(t(nil, b, nil), a, t(t(nil, d, nil), c, nil))`

## 2. Binary Dictionaries (Search Trees)
- **Definition**: A binary tree ordered from left to right.
  - All items in `Left` are smaller than `Root`.
  - All items in `Right` are greater than `Root`.
- **Efficiency**: Searching in a balanced binary dictionary is faster (O(log n)) compared to a list (O(n)).
- **Operations**:
  - `in/2`: Check if element exists.
  - `addleaf/3`: Insert at a leaf.
  - `del/3`: Delete a node (requires restructuring if the node has children).
  - `addroot/3`: Insert an element at the root (used for non-deterministic insertion anywhere).

## 3. Graphs
- **Representation**: Nodes (vertices) and Edges (arcs).
- **Facts**: 
  - `connected(a, b).`
  - `arc(s, t, 3).` (Directed graph with cost 3).
- **Data Structures**:
  - `graph([a,b,c,d], [e(a,b), e(b,c)])`
  - Adjacency list: `[a->[b], b->[a,c]]`
- **Operations**:
  - Find a path between two nodes.
  - Hamiltonian path (visits all nodes exactly once).
  - Minimum cost path (shortest path).

## 4. Spanning Trees
- **Definition**: A subgraph that connects all vertices, has the same nodes as the original graph, is connected, and contains no cycles.
- **Implementation**: `stree(Graph, Tree)`.
- **Applications**: Finding the minimum cost spanning tree.

## 5. State Space Search
- **Concept**: Modeling problems as states and transitions (moves).
- **Examples**:
  - **Monkey and Banana**: `state(MonkeyPos, MonkeyOn, BoxPos, HasBanana)`. Transitions like `grasp`, `climb`, `push`, `walk`.
  - **Missionaries and Cannibals**: Safely transport 3 missionaries and 3 cannibals across a river using a 2-person boat. `state(MB, CB, Bank)`.
  - **Water Jugs**: Given an 8-liter and 5-liter jug, measure exactly 4 liters. `jugs(V1, V2)`.
- **Search Strategies**:
  - Depth-First Search (DFS): Explores one path as far as possible before backtracking.
  - Breadth-First Search (BFS) / others.
- **Avoiding Cycles**: Need to keep track of visited states (`SoFarStates`) to prevent infinite loops.

## 6. Logic Puzzles
- **Zebra Puzzle**: Five houses, different colors, nationalities, pets, drinks, cigarettes. Use `generate-and-test` vs `constrain-and-generate` (much faster).
- **Eight Queens**: Place 8 queens on a chessboard so no two attack each other.
  - Approach 1: Simple permutations.
  - Approach 2/3: Using coordinates (`X/Y`), diagonals (`u = x-y`, `v = x+y`).

---

## Fidelity Checklist & Mandatory Items
- [x] Binary tree representation `t(Left, Root, Right)` and `nil`.
- [x] Binary dictionary definition (left < root < right).
- [x] Tree operations (`in`, `addleaf`, `del`, `addroot`).
- [x] Graph representation (facts vs structures, directed vs undirected).
- [x] Path finding (`path/4`, `hamiltonian/2`).
- [x] Spanning tree definition and algorithms.
- [x] The Zebra Puzzle (generate and test approach).
- [x] Missionaries and Cannibals state representation and move rules.
- [x] Water Jugs problem state representation and transition logic.
- [x] Depth-First Search (`depth_first_search`) implementation.
- [x] 8 Queens problem variations (coordinates, diagonals).
