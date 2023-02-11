import * as Layer from "@effect/io/Layer";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
import * as S from "@fp-ts/schema/Schema";
import * as P from "@fp-ts/schema/Parser";
import * as Supabase from "../services/Supabase";
import * as Clerk from "../services/Clerk";
import { Database } from "~supabase/types";
import { pipe } from "@effect/data/Function";
import { Player } from ".";

type _Team = Database["public"]["Tables"]["teams"]["Row"];
type _TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
type _TeamUpdate = Database["public"]["Tables"]["teams"]["Update"];
export interface Team extends _Team {}
export interface TeamInsert extends _TeamInsert {}
export interface TeamUpdate extends _TeamUpdate {}

export const CreateSchema = S.struct({
  name: pipe(S.string, S.minLength(3)),
  players: S.array(S.string),
});
interface CreateTeam extends S.Infer<typeof CreateSchema> {}

const _createTeam = (team: CreateTeam) =>
  pipe(
    Effect.service(Clerk.service),
    Effect.flatMap(({ auth }) =>
      Supabase.request((client) =>
        client
          .from("teams")
          .insert({ name: team.name, user_id: auth.userId })
          .select()
          .single()
      )
    ),
    Effect.flatMap(Supabase.toData),
    Effect.flatMap(({ id: team_id }) =>
      Supabase.request((client) =>
        client
          .from("teams_players")
          .insert(team.players.map((player_id) => ({ player_id, team_id })))
      )
    ),
    Effect.asUnit,
    Effect.orDie
  );

const GetOwnData = S.struct({
  id: S.string,
  name: S.string,
  players: S.array(
    S.struct({
      id: S.string,
      name: S.string,
      ppg: S.number,
      team: S.string,
      seed: S.number,
      scores: S.any,
    })
  ),
});

const _getOwn = pipe(
  Supabase.request((client) =>
    client
      .from("teams")
      .select(
        `
            id, name,
            players (id, name, ppg, team, seed, scores:game_score (*))
            `
      )
      .single()
  ),
  Effect.flatMap(Supabase.toData),
  Effect.map(P.decodeOrThrow(GetOwnData)),
  Effect.catchTag("SupabaseNotFoundError", () => Effect.succeed(null)),
  Effect.orDie
);
export interface GetOwnData extends S.Infer<typeof GetOwnData> {}

export interface TeamRepository {
  readonly _tag: "TeamRepository";
  readonly createTeam: typeof _createTeam;
  readonly getOwn: typeof _getOwn;
}
export const repository = Context.Tag<TeamRepository>();

export const getOwn = Effect.serviceWithEffect(repository, (t) => t.getOwn);
export const createTeam = (team: CreateTeam) =>
  Effect.serviceWithEffect(repository, (t) => t.createTeam(team));

export const layer = Layer.succeed(repository, {
  _tag: "TeamRepository",
  createTeam: _createTeam,
  getOwn: _getOwn,
});
