import { pipe } from "@effect/data/Function";
import * as Cause from "@effect/io/Cause";
import * as Effect from "@effect/io/Effect";
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
              {team.players.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {p.scores ? (
                    <>
                      <th>{p.scores[0]}</th>
                      <th>{p.scores[1]}</th>
                      <th>{p.scores[2]}</th>
                      <th>{p.scores[3]}</th>
                      <th>{p.scores[4]}</th>
                      <th>{p.scores[5]}</th>
                    </>
                  ) : (
                    <>
                      <th>-</th>
                      <th>-</th>
                      <th>-</th>
                      <th>-</th>
                      <th>-</th>
                      <th>-</th>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
