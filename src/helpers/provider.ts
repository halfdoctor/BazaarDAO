import { FallbackEvmProvider } from '@distributedlab/w3p';

import { FALLBACK_PROVIDER_NAMES } from 'constants/providers';

export class MainnetFallback extends FallbackEvmProvider {
  static get providerType (): string {
    return FALLBACK_PROVIDER_NAMES.mainnetFallback;
  }
}

export class TestnetFallback extends FallbackEvmProvider {
  static get providerType (): string {
    return FALLBACK_PROVIDER_NAMES.testnetFallback;
  }
}

export class DevnetFallback extends FallbackEvmProvider {
  static get providerType (): string {
    return FALLBACK_PROVIDER_NAMES.devnetFallback;
  }
}
