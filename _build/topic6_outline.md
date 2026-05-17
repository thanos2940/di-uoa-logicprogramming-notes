# Chapter 6: Logic and the Semantic Web — Outline

## 1. Introduction to the Semantic Web
- Definition and vision (metadata for the web).
- The "Layer Cake" of the Semantic Web (implied by the progression).

## 2. RDF & RDFS
- **RDF (Resource Description Framework)**:
  - Triples: (Subject, Predicate, Object).
  - URIs for identification.
  - Logical view: $P(x, y)$.
  - Querying via SPARQL (brief mention).
- **RDFS (RDF Schema)**:
  - Vocabulary description.
  - Classes, Instances, Properties.
  - Hierarchy: `subClassOf`, `subPropertyOf`.

## 3. OWL (Web Ontology Language)
- Purpose: More expressive than RDFS.
- Versions:
  - **OWL-Lite**: Lower complexity.
  - **OWL-DL**: Based on Description Logics (decidable).
  - **OWL Full**: Maximum expressiveness (undecidable).

## 4. Description Logics (DL)
- **Basic Components**:
  - **Concepts**: Unary predicates (e.g., `Person`).
  - **Roles**: Binary predicates (e.g., `hasChild`).
  - **Individuals**: Specific instances (e.g., `Mary`).
- **Knowledge Base (KB)**:
  - **TBox (Terminology)**: Definitions and axioms (e.g., `Doctor ⊆ Person`).
  - **ABox (Assertions)**: Facts about individuals (e.g., `John: HappyParent`).
- **Reasoning**: Satisfiability and Subsumption.

## 5. Logic Rules (SWRL & RuleML)
- **SWRL (Semantic Web Rule Language)**: Combining OWL with Horn rules.
- **RuleML**: Collaboration with W3C.
- **Closed vs. Open World Semantics**: Contrast between Prolog (CWA) and Semantic Web (OWA).

---

## Fidelity Checklist & Mandatory Items
- [ ] Define RDF triples $(x, P, y)$ and their relation to binary predicates.
- [ ] List the three versions of OWL (Lite, DL, Full) and their characteristics.
- [ ] Differentiate between TBox (definitions) and ABox (facts).
- [ ] Explain the components of Description Logics (Concepts, Roles, Individuals).
- [ ] Mention the contrast between "Closed World" (Prolog) and "Open World" (Semantic Web) semantics.
- [ ] Include references: Ivan Bratko, Jeffrey Ullman, and W3C resources.
