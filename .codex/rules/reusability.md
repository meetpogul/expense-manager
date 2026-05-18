# Reusability Rules

- Prefer feature-local helpers, hooks, and components until a second real use case appears.
- Extract shared code only when it removes meaningful duplication across features for the same reason.
- Keep shared UI primitives domain-free and reusable.
- Do not add deep abstraction chains for one caller.
- Preserve public feature barrels as small, intentional APIs; avoid reaching into internals when a barrel exists.
