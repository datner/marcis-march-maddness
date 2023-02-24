create policy "Enable read access for all users"
on "public"."game_score"
as permissive
for select
to authenticated
using (true);



