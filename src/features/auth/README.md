# auth

Handles user authentication: sign-in, sign-up, and session management.

## Data Flow

```
AuthForm (client component)
  └─ useFormState(signInAction | signUpAction)
       └─ server/actions.ts          ← validates credentials, calls Supabase Auth
            └─ Supabase Auth API     ← returns session / error
                 └─ redirect()       ← sends user to / on success
```

## Domain

- `domain/types.ts` — `AuthMode` (`"signin" | "signup"`) controls which form path renders.
- `domain/constants.ts` — mode labels and toggle button text.

## Business Rules

- `signin` calls `supabase.auth.signInWithPassword`.
- `signup` calls `supabase.auth.signUp`.
- On success both paths redirect to `/`.
- Errors surface as `ActionState` messages displayed inside `AuthForm`.
- The session is managed entirely by Supabase SSR cookies; no client-side token storage.

## Architecture Notes

Auth is kept deliberately simple — no entity classes, no repositories. The session
helper (`server/session.ts`) is used by all other feature server actions to obtain the
authenticated `supabase` client and `userId`.
