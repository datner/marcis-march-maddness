"use client";
import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import * as RA from "@effect/data/ReadonlyArray";
import * as Player from "~lib/repositories/Player";
import { forwardRef, Fragment, useMemo } from "react";
import { pipe } from "@effect/data/Function";
import * as Order from "@effect/data/typeclass/Order";

type Props = {
  players: ReadonlyArray<Player.Player>;
  selected: ReadonlyArray<string>;
  value: string | undefined;
  onValueChange: (playerName: string) => void;
};

const SelectItem = forwardRef<
  HTMLDivElement,
  { player: Player.Player; picked: boolean }
>((props, ref) => {
  const { player, picked } = props;
  return (
    <Select.Item
      className="btn data-[state=unchecked]:aria-readonly:btn-disabled justify-between indicator w-full"
      aria-readonly={picked}
      value={player.id}
      ref={ref}
    >
      <Select.ItemText className="grow">{player.name}</Select.ItemText>
      <div className="badge badge-outline">PPG {player.ppg}</div>
      <Select.ItemIndicator className="indicator-item badge badge-success">
        <CheckIcon className="w-6 h-6" />
      </Select.ItemIndicator>
    </Select.Item>
  );
});
SelectItem.displayName = "SelectItem";

const orderByPpg = Order.contramap<number, Player.Player>(
  Order.number,
  (p) => p.ppg
);
const orderByTeam = Order.contramap<string, Player.Player>(
  Order.string,
  (p) => p.team
);

export function PlayerSelect(props: Props) {
  const { players, onValueChange, selected: picked, value } = props;
  const teams = useMemo(() => {
    if (!RA.isNonEmptyReadonlyArray(players)) return RA.empty();

    return pipe(
      players,
      RA.sortNonEmpty(orderByPpg),
      RA.sortNonEmpty(orderByTeam),
      RA.group((p1, p2) => p1.team === p2.team)
    );
  }, [players]);

  return (
    <Select.Root name="players[]" value={value} onValueChange={onValueChange}>
      <Select.Trigger className="btn">
        <Select.Value placeholder="Select a player" />
        <Select.Icon className="SelectIcon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="card card-bordered bg-base-100 shadow-xl">
          <Select.ScrollUpButton className="SelectScrollButton">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="card-body">
            {teams.map((players, i) => {
              const { team, region } = RA.headNonEmpty(players);
              return (
                <Fragment key={team}>
                  <Select.Group className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <Select.Label className="card-title">{team}</Select.Label>
                      <div className="italic">{region}</div>
                    </div>
                    {players
                      .sort((p1, p2) => p2.ppg - p1.ppg)
                      .map((player) => (
                        <SelectItem
                          key={player.id}
                          picked={picked.includes(player.id)}
                          player={player}
                        />
                      ))}
                  </Select.Group>
                  {i < teams.length - 1 && (
                    <Select.Separator className="divider" />
                  )}
                </Fragment>
              );
            })}
          </Select.Viewport>
          <Select.ScrollDownButton className="SelectScrollButton">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
