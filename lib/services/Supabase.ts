import * as Config from "@effect/io/Config";
import * as Effect from "@effect/io/Effect";
import * as Exit from "@effect/io/Exit";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";
import * as Data from "@effect/data/Data";
import {
  createClient,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Database } from "~supabase/types";
import { auth } from "@clerk/nextjs/app-beta";
import { pipe, hole } from "@effect/data/Function";
import * as Clerk from "./Clerk";

export interface SupabaseService {
  readonly _tag: "SupabaseService";
  readonly client: SupabaseClient<Database>;
}
export const service = Context.Tag<SupabaseService>();

interface SupabaseError extends Data.Case {
  readonly _tag: "SupabaseError";
  readonly error: unknown;
}
export const error = Data.tagged<SupabaseError>("SupabaseError");
const _error = error;

interface SupabaseNotFoundError extends Data.Case {
  readonly _tag: "SupabaseNotFoundError";
  readonly error: unknown;
}
export const NotFound = Data.tagged<SupabaseNotFoundError>(
  "SupabaseNotFoundError"
);

export const SupabaseConfig = Config.struct({
  url: Config.string("nextPublicSupabaseUrl"),
  apiKey: Config.string("nextPublicSupabaseApiKey"),
});

export const getClient = Effect.gen(function* ($) {
  const { getToken } = auth();
  const token = yield* $(
    Effect.promise(() =>
      getToken({
        template:
          process.env.NODE_ENV === "production" ? "supabase" : "supabase-local",
      })
    )
  );

  if (!token) {
    yield* $(Effect.die(new Error("no token returned")));
  }

  const { url, apiKey } = yield* $(Effect.config(SupabaseConfig));
  return createClient<Database>(url, apiKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
});

export const withClient = <A extends Promise<any>>(
  f: (client: SupabaseClient<Database>) => A
) =>
  Effect.serviceWith(service, ({ client }) =>
    Effect.tryCatchPromise(
      () => f(client),
      (error) => _error({ error })
    )
  );

export const request = <A>(
  f: (
    client: SupabaseClient<Database>
  ) => PromiseLike<PostgrestSingleResponse<A>>
) =>
  Effect.serviceWithEffect(service, ({ client }) =>
    Effect.async<never, never, PostgrestSingleResponse<A>>((resume) =>
      f(client).then((a) => resume(Exit.succeed(a)))
    )
  );

export const toData = <A>(
  res: PostgrestSingleResponse<A>
): Effect.Effect<never, SupabaseError | SupabaseNotFoundError, A> =>
  res.error
    ? Effect.fail(
        res.error.code === "PGRST116"
          ? NotFound({ error: res.error })
          : error({ error: res.error })
      )
    : Effect.succeed(res.data);

const createClient$ = (token: string) =>
  pipe(
    Effect.config(SupabaseConfig),
    Effect.map(({ url, apiKey }) =>
      createClient<Database>(url, apiKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
    )
  );

export const provideService = Effect.provideServiceEffect(
  service,
  Effect.serviceWithEffect(Clerk.service, ({ auth }) =>
    Effect.gen(function* ($) {
      const token = yield* $(
        Effect.promise(() =>
          auth.getToken({
            template:
              process.env.NODE_ENV === "production"
                ? "supabase"
                : "supabase-local",
          })
        )
      );

      if (!token) {
        yield* $(Effect.die(new Error("no token returned")));
        return hole<SupabaseService>();
      }

      return {
        _tag: "SupabaseService",
        client: yield* $(createClient$(token)),
      } as const;
    })
  )
);

export const layer = Layer.effect(
  service,
  Effect.gen(function* ($) {
    const { url, apiKey } = yield* $(Effect.config(SupabaseConfig));

    return {
      _tag: "SupabaseService",
      client: createClient<Database>(url, apiKey),
    } as const;
  })
);
