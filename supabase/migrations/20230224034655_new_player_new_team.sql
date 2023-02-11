create table "public"."game_score" (
    "id" uuid not null,
    "active" boolean not null default true,
    "points" bigint[]
);


alter table "public"."game_score" enable row level security;

create table "public"."players" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "ranking" bigint not null,
    "ppg" double precision not null,
    "name" text not null,
    "region" text not null,
    "team" text not null,
    "seed" integer not null
);


alter table "public"."players" enable row level security;

create table "public"."teams" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "user_id" text not null,
    "name" text not null
);


alter table "public"."teams" enable row level security;

create table "public"."teams_players" (
    "player_id" uuid not null,
    "team_id" uuid not null
);


alter table "public"."teams_players" enable row level security;

CREATE UNIQUE INDEX "Players_pkey" ON public.players USING btree (id);

CREATE UNIQUE INDEX "Teams_pkey" ON public.teams USING btree (id);

CREATE UNIQUE INDEX game_state_pkey ON public.game_score USING btree (id);

CREATE UNIQUE INDEX players_id_key ON public.players USING btree (id);

CREATE UNIQUE INDEX teams_id_key ON public.teams USING btree (id);

CREATE UNIQUE INDEX teams_players_pkey ON public.teams_players USING btree (player_id, team_id);

alter table "public"."game_score" add constraint "game_state_pkey" PRIMARY KEY using index "game_state_pkey";

alter table "public"."players" add constraint "Players_pkey" PRIMARY KEY using index "Players_pkey";

alter table "public"."teams" add constraint "Teams_pkey" PRIMARY KEY using index "Teams_pkey";

alter table "public"."teams_players" add constraint "teams_players_pkey" PRIMARY KEY using index "teams_players_pkey";

alter table "public"."game_score" add constraint "game_score_id_fkey" FOREIGN KEY (id) REFERENCES players(id) not valid;

alter table "public"."game_score" validate constraint "game_score_id_fkey";

alter table "public"."players" add constraint "players_id_key" UNIQUE using index "players_id_key";

alter table "public"."teams" add constraint "teams_id_key" UNIQUE using index "teams_id_key";

alter table "public"."teams_players" add constraint "teams_players_player_id_fkey" FOREIGN KEY (player_id) REFERENCES players(id) not valid;

alter table "public"."teams_players" validate constraint "teams_players_player_id_fkey";

alter table "public"."teams_players" add constraint "teams_players_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) not valid;

alter table "public"."teams_players" validate constraint "teams_players_team_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.requesting_user_id()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$function$
;

create policy "Enable select for authenticated users only"
on "public"."players"
as permissive
for select
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."teams"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for own team"
on "public"."teams"
as permissive
for select
to authenticated
using ((requesting_user_id() = user_id));


create policy "Enable insert for authenticated users only"
on "public"."teams_players"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."teams_players"
as permissive
for select
to public
using (true);



