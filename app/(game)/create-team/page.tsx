import { pipe } from "@effect/data/Function";
import * as RA from "@effect/data/ReadonlyArray";
import * as Effect from "@effect/io/Effect";
import { runPromise$ } from "~lib/effect";
import * as Player from "~lib/repositories/Player";
import * as Supabase from "~lib/services/Supabase";
import * as Clerk from "~lib/services/Clerk";
import { Form } from "./Form";
import { TeamBlock } from "./TeamBlock";

/// gift by gcanti <3
// const groupBy: {
//   <K extends string & Brand<any>, A>(f: (a: A) => K): (self: Iterable<A>) => Record<K, NonEmptyArray<A>>
//   <K extends string & Brand<any>, A>(self: Iterable<A>, f: (a: A) => K): Record<K, NonEmptyArray<A>>
//   <A>(f: (a: A) => string): (self: Iterable<A>) => Record<string, NonEmptyArray<A>>
//   <A>(self: Iterable<A>, f: (a: A) => string): Record<string, NonEmptyArray<A>>
// } = RA.groupBy

const getPlayers = async (seeds: number[]) =>
  pipe(
    Effect.serviceWithEffect(Player.repository, (p) => p.getSeeds(seeds)),
    Supabase.provideService,
    Clerk.authorizeServerComponent,
    runPromise$
  );

export default async function CreateTeam() {
  return (
    <div className="container mx-auto p-2">
      <h2 className="text-xl">Team</h2>
      <Form>
        <div className="grid grid-cols-3 gap-2 max-w-6xl">
          <div className="form-control col-span-2">
            <label className="label" htmlFor="teamName">
              <span className="label-text">What is your team name?</span>
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              className="input input-bordered"
            />
          </div>
          <div className="flex items-end">
            <button className="btn w-full">Create Team</button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <TeamBlock
            playerPool={await getPlayers(RA.range(1, 4))}
            title={<div className="text-xl mb-2">Seeds 1-4</div>}
          />
          <TeamBlock
            playerPool={await getPlayers(RA.range(5, 8))}
            title={<div className="text-xl mb-2">Seeds 5-8</div>}
          />
          <TeamBlock
            playerPool={await getPlayers(RA.range(9, 12))}
            title={<div className="text-xl mb-2">Seeds 9-12</div>}
          />
          <TeamBlock
            playerPool={await getPlayers(RA.range(13, 16))}
            title={<div className="text-xl mb-2">Seeds 13-16</div>}
          />
        </div>
      </Form>
    </div>
  );
}
