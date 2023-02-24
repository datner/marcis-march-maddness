"use client";
import * as RA from "@effect/data/ReadonlyArray";
import * as O from "@effect/data/Option";
import * as S from "@fp-ts/schema/Schema";
import { identity } from "@effect/data/Function";
import * as Opt from "@fp-ts/optic";
import { PlayerSelect } from "./PlayerSelect";
import { ReactNode, Reducer, useReducer } from "react";
import clsx from "clsx";
import type * as Player from "~lib/repositories/Player";

type Props = {
  playerPool: ReadonlyArray<Player.Player>;
  title: ReactNode;
};

const Pick = S.option(S.string);
const Picks = S.tuple(Pick, Pick, Pick, Pick);
type Picks = S.Infer<typeof Picks>;
type Action = [number, string];
const picks = Opt.id<Picks>();

const reducer: Reducer<Picks, Action> = (state, [idx, id]) =>
  Opt.replace(picks.at(idx))(O.some(id))(state);

export function TeamBlock(props: Props) {
  const { playerPool: players, title } = props;
  const [picked, update] = useReducer(reducer, [
    O.some(players[0].id),
    O.some(players[1].id),
    O.some(players[2].id),
    O.some(players[3].id),
  ]);
  const changeAt = (idx: number) => (player: string) => update([idx, player]);

  const selected = RA.filterMap(picked, identity);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        {title}
        <div
          className={clsx(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-base-300 p-6 rounded-xl gap-8",
            selected.length >= 4 ? "bg-success" : "bg-base-200"
          )}
        >
          {RA.range(0, 3).map((idx) => (
            <PlayerSelect
              key={idx}
              players={players}
              selected={selected}
              value={O.getOrUndefined(picked[idx])}
              onValueChange={changeAt(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
