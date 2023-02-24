import * as Brand from "@effect/data/Brand";

type NonEmptyString = string & Brand.Brand<"NonEmptyString">;
const NonEmptyString = Brand.refined<NonEmptyString>(Boolean, () =>
  Brand.error("Expected string to be non-empty")
);
export type Team = string & Brand.Brand<"Team">;
export const Team = Brand.all(NonEmptyString, Brand.nominal<Team>());
