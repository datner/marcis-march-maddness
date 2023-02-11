import * as Layer from "@effect/io/Layer";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
import * as Supabase from "../services/Supabase";
import { Database } from "~supabase/types";
import { pipe } from "@effect/data/Function";

type _Player = Database["public"]["Tables"]["players"]["Row"];
type _PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
type _PlayerUpdate = Database["public"]["Tables"]["players"]["Update"];
export interface Player extends _Player {}
export interface PlayerInsert extends _PlayerInsert {}
export interface PlayerUpdate extends _PlayerUpdate {}

const getSeed = (seed: number) =>
  pipe(
    Supabase.request((client) =>
      client.from("players").select().eq("seed", seed)
    ),
    Effect.flatMap(Supabase.toData),
    Effect.orDie
  );

const getSeeds = (seeds: number[]) =>
  pipe(
    Effect.succeed(seeds),
    Effect.flatMap((s) =>
      Supabase.request((client) =>
        client.from("players").select().in("seed", s).order("ppg").order("team")
      )
    ),
    Effect.flatMap(Supabase.toData),
    Effect.orDie
  );

export interface PlayerRepository {
  readonly _tag: "PlayerRepository";
  readonly getSeed: (
    seed: number
  ) => Effect.Effect<Supabase.SupabaseService, never, ReadonlyArray<Player>>;
  readonly getSeeds: (
    seeds: number[]
  ) => Effect.Effect<Supabase.SupabaseService, never, ReadonlyArray<Player>>;
}
export const repository = Context.Tag<PlayerRepository>();

export const layer = Layer.succeed(repository, {
  _tag: "PlayerRepository",
  getSeed,
  getSeeds,
});
