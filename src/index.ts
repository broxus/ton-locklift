import { ProviderRpcClient } from "everscale-inpage-provider";
import { Clock, EverscaleStandaloneClient, SimpleKeystore } from "everscale-standalone-client/nodejs";

import { Keys } from "./keys";
import { ConfigState, LockliftConfig } from "./config";
import * as utils from "./utils";
import { IGiver } from "./factory";
import { Factory } from "./factory";
import { Transactions } from "./utils";
import { createTracing, Tracing } from "./tracing";
import { getGiverKeyPair } from "./utilsInternal";

export * from "everscale-inpage-provider";
export { Dimension, zeroAddress } from "./constants";
export type { LockliftConfig } from "./config";

export class Locklift<FactorySource = any> {
  public readonly utils = utils;

  private constructor(
    public readonly factory: Factory<FactorySource>,
    public readonly giver: IGiver,
    public readonly provider: ProviderRpcClient,
    public readonly clock: Clock,
    public readonly keystore: SimpleKeystore,
    public readonly transactions: Transactions,
    public readonly tracing: Tracing,
  ) {}

  public static async setup<T>(
    config: LockliftConfig<ConfigState.INTERNAL>,
    network: keyof LockliftConfig["networks"] = "local",
  ): Promise<Locklift<T>> {
    try {
      const networkConfig = config.networks[network];

      const giverKeys = getGiverKeyPair(networkConfig.giver);
      const keys = await Keys.generate(networkConfig.keys);

      const keystore = new SimpleKeystore(
        [...keys].reduce(
          (acc, keyPair, idx) => ({
            ...acc,
            [idx]: keyPair,
          }),
          {},
        ),
      );
      keystore.addKeyPair("giver", giverKeys);

      const clock = new Clock();
      const provider = new ProviderRpcClient({
        fallback: () =>
          EverscaleStandaloneClient.create({
            connection: networkConfig.connection,
            keystore,
            clock,
          }),
      });
      await provider.ensureInitialized();

      const giver = networkConfig.giver.giverFactory(provider, giverKeys, networkConfig.giver.address);

      const factory = await Factory.setup<T>(provider, giver);

      const transactions = new Transactions(provider);

      const tracing = createTracing({
        ever: provider,
        features: transactions,
        factory,
        endpoint: networkConfig.tracing?.endpoint,
      });

      return new Locklift<T>(factory, giver, provider, clock, keystore, transactions, tracing);
    } catch (e) {
      throw e;
    }
  }
}
