import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as S from "@fp-ts/schema/Schema";
import * as P from "@fp-ts/schema/Parser";
import { NextApiHandler } from "next";
import { runPromise$ } from "~lib/effect";

const AddPlayers = S.struct({
  players: S.any,
});

const handler = ((req, res) =>
  pipe(
    Effect.sync(() => console.log(req.body)),
    // Effect.fromEither(P.decode(AddPlayers)(req.body)),
    // Effect.tap(f => Effect.log(JSON.stringify(f.players))),
    Effect.match(
      () => res.status(500).json({ opps: "an error" }),
      () => res.status(302).redirect("/_/add-players")
    ),
    runPromise$
  )) satisfies NextApiHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
