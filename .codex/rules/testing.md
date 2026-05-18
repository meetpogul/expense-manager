# Testing Rules

- Start substantial AI edits with `pnpm check:ai:start`; finish with `pnpm check:ai:end`.
- Target 95-100% meaningful coverage for changed code, with tests focused on behavior rather than export padding.
- Put pure domain tests in `domain/__tests__`.
- Put component tests in colocated `components/__tests__`.
- Test server mutation orchestration with in-memory repositories; do not call Supabase from unit tests.
- Mock server actions in `test/setup.ts` so component tests never hit the network.
- Add or update coverage includes when a new feature layer becomes important behavior.
