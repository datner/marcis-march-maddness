import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as Cause from "@effect/io/Cause";
import * as Effect from "@effect/io/Effect";
import * as Optic from "@fp-ts/optic";
import { redirect } from "next/navigation";
import { runPromise$ } from "~lib/effect";
import { Team } from "~lib/repositories";
import { Supabase, Clerk } from "~lib/services";
import { Title } from "./Title";

const fetchTeam = pipe(
  Team.getOwn,
  Supabase.provideService,
  Clerk.authorizeServerComponent,
  Effect.tapErrorCause((cause) =>
    Effect.sync(() => console.log(Cause.pretty(cause)))
  )
);

const _gameScore = (game: number) =>
  Optic.id<Team.GetOwnData["players"][number]>()
    .at("stats")
    .at("points")
    .some()
    .index(game - 1);

const zoom = (player: Team.GetOwnData["players"][number]) => ({
  game: (game: number) =>
    pipe(
      player,
      Optic.getOption(_gameScore(game)),
      O.getOrElse(() => "-")
    ),
});

export default async function DashboardPage() {
  const team = await runPromise$(fetchTeam);

  if (!team) {
    redirect("/create-team");
  }

  return (
    <div className="sm:px-4">
      <Title />
      <div>
        <span>Go Team {team.name}!!</span>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Player</th>
                <th>Round 1</th>
                <th>Round 2</th>
                <th>Round 3</th>
                <th>Round 4</th>
                <th>Round 5</th>
                <th>Round 6</th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((p) => {
                const _p = zoom(p);
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <th>{_p.game(1)}</th>
                    <th>{_p.game(2)}</th>
                    <th>{_p.game(3)}</th>
                    <th>{_p.game(4)}</th>
                    <th>{_p.game(5)}</th>
                    <th>{_p.game(6)}</th>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
