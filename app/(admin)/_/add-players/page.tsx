"use client";
import * as Effect from "@effect/io/Effect";
import * as S from "@fp-ts/schema/Schema";
import * as P from "@fp-ts/schema/Parser";
import { parseNumber } from "@fp-ts/schema/data/String";
import { useAuth } from "@clerk/nextjs";
import { FormEventHandler, useState } from "react";
import { parse } from "csv-parse/sync";
import { supabaseClient } from "~lib/supabase";
import { pipe } from "@effect/data/Function";
import type { PlayerInsert } from "~lib/repositories/Player";
import { runPromise$ } from "~lib/effect";

const FileSchema = pipe(S.object, S.instanceOf(File));
const decodeToFile = P.decode(FileSchema);

const Player: S.Schema<PlayerInsert> = S.struct({
  name: S.string,
  ppg: pipe(S.string, parseNumber),
  team: S.string,
  seed: pipe(S.string, parseNumber),
  region: S.string,
  ranking: pipe(S.string, parseNumber),
});

export default function AddPlayersPage() {
  const { getToken } = useAuth();
  const [state, setState] = useState("initial");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    return runPromise$(
      pipe(
        Effect.sync(() => e.preventDefault()),
        Effect.flatMap(() =>
          Effect.promise(() => getToken({ template: "supabase" }))
        ),
        Effect.map((a) => supabaseClient(a as string)),
        Effect.flatMap((supabase) =>
          pipe(
            Effect.succeed(formData.get("players")),
            Effect.map((u) => decodeToFile(u)),
            Effect.absolve,
            Effect.flatMap((file) => Effect.promise(() => file.text())),
            Effect.map((csv) => parse(csv, { columns: true })),
            Effect.map((players) => P.decodeOrThrow(S.array(Player))(players)),
            Effect.map((players) =>
              supabase.from("Players").insert(players as PlayerInsert[])
            )
          )
        ),
        Effect.flatMap((supaPromise) =>
          Effect.promise(async () => supaPromise)
        ),
        Effect.flatMap((a) =>
          Effect.cond(
            () => !a.error,
            () => a.data,
            () => a.error
          )
        ),
        Effect.tapError((err) => Effect.sync(() => console.log(err))),
        Effect.match(
          () => setState("error"),
          () => setState("success")
        )
      )
    );
  };

  return (
    <div className="p-4">
      <h2>{state}</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <input
            type="file"
            name="players"
            className="file-input file-input-bordered"
          />
        </div>

        <div>
          <input type="submit" className="btn" />
        </div>
      </form>
    </div>
  );
}
