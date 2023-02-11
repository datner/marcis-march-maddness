import * as Exit from "@effect/io/Exit";
import * as Scope from "@effect/io/Scope";
import * as Logger from "@effect/io/Logger";
import * as Runtime from "@effect/io/Runtime";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as ConfigProvider from "@effect/io/Config/Provider";
import * as Player from "./repositories/Player";
import * as Team from "./repositories/Team";
import { pipe } from "@effect/data/Function";

const provider = ConfigProvider.constantCase(ConfigProvider.fromEnv());

export const AppContext = pipe(
  Logger.logFmt,
  Layer.merge(Effect.setConfigProvider(provider)),
  Layer.merge(Player.layer),
  Layer.merge(Team.layer)
);

export const $runtime = Runtime.runSync(Runtime.defaultRuntime);

export const makeRuntime = <R, E, A>(layer: Layer.Layer<R, E, A>) =>
  Effect.gen(function* ($) {
    const scope = yield* $(Scope.make());
    const env = yield* $(Layer.buildWithScope(layer, scope));
    const runtime = yield* $(
      pipe(Effect.runtime<A>(), Effect.scoped, Effect.provideContext(env))
    );

    return {
      runtime,
      clean: Scope.close(scope, Exit.unit()),
    };
  });

export const basicRuntime = pipe(
  makeRuntime(AppContext),
  Runtime.runSync(Runtime.defaultRuntime)
);
console.log("regenerating");

export const runPromise$ = Runtime.runPromise(basicRuntime.runtime);
export const runPromiseEither$ = Runtime.runPromiseEither(basicRuntime.runtime);
