import * as Cause from "@effect/io/Cause";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as Data from "@effect/data/Data";
import * as P from "@fp-ts/schema/Parser";
import { NextApiHandler } from "next";
import * as Team from "~lib/repositories/Team";
import * as Supabase from "~lib/services/Supabase";
import * as Clerk from "~lib/services/Clerk";
import { runPromise$ } from "~lib/effect";

interface NotAuthorizedError extends Data.Case {
  readonly _tag: "NotAuthorizedError";
}
const NotAuthorizedError =
  Data.tagged<NotAuthorizedError>("NotAuthorizedError");

const handler = ((req, res) =>
  pipe(
    Effect.succeed(req),
    Effect.map((r) => JSON.parse(r.body)),
    Effect.map(P.decodeOrThrow(Team.CreateSchema)),
    Effect.tap((t) => Effect.log(`Creating Team "${t.name}"`)),
    Effect.flatMap(Team.createTeam),
    Effect.tap(() => Effect.log(`Team successfully created!"`)),
    Supabase.provideService,
    Clerk.authorizeApi(req),
    Effect.tapErrorCause((cause) =>
      Effect.sync(() => console.log(Cause.pretty(cause)))
    ),
    Effect.match(
      (e) => {
        switch (e._tag) {
          case "NotAuthorizedError":
            return res.status(401).json({ unauthorized: "please log in" });

          // there are many ways for the config to error
          default:
            return res.status(500).json({ opps: "an error" });
        }
      },
      () => res.status(302).redirect("/dashboard")
    ),
    runPromise$
  )) satisfies NextApiHandler;

export default handler;
