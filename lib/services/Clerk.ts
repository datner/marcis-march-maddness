import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
import * as Data from "@effect/data/Data";
import { auth } from "@clerk/nextjs/app-beta";
import {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/dist/api";
import { pipe } from "@effect/data/Function";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";

export interface ClerkService {
  readonly _tag: "ClerkService";
  readonly auth: SignedInAuthObject;
}
export const service = Context.Tag<ClerkService>();

interface SignedOutError extends Data.Case {
  readonly _tag: "SignedOutError";
}
const SignedOutError = Data.tagged<SignedOutError>("SignedOutError");

const authorize = (auth: SignedInAuthObject | SignedOutAuthObject) =>
  Effect.filterOrFail(
    Effect.succeed(auth),
    (u): u is SignedInAuthObject => u.userId != null,
    () => SignedOutError()
  );

const toService = (auth: SignedInAuthObject): ClerkService => ({
  _tag: "ClerkService",
  auth,
});

export const authorizeServerComponent = Effect.provideServiceEffect(
  service,
  pipe(
    Effect.sync(() => auth()),
    Effect.tap((a) => Effect.log("authenticating user: " + a.userId)),
    Effect.flatMap(authorize),
    Effect.map(toService)
  )
);

export const authorizeApi = (req: NextApiRequest) =>
  Effect.provideServiceEffect(
    service,
    pipe(
      Effect.sync(() => getAuth(req)),
      Effect.tap((a) => Effect.log("authenticating user: " + a.userId)),
      Effect.flatMap(authorize),
      Effect.map(toService)
    )
  );
