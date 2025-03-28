import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';

export class LitContractsInstance {
  private readonly contractsInstance: LitContracts;

  private isConnected: boolean = false;

  private connectHandle: Promise<boolean> | null = null;

  constructor({ network }: { network: LIT_NETWORKS_KEYS }) {
    this.contractsInstance = new LitContracts({
      network,
      debug: true,
    });
  }

  async connect(): Promise<boolean> {
    if (!this.isConnected) {
      // Coalesce concurrent calls
      if (this.connectHandle) {
        return this.connectHandle;
      }

      // Stash a handle so concurrent calls to connect are coaelesced into 1
      this.connectHandle = this.contractsInstance.connect().then(() => true);

      try {
        // Don't return until we know the result of pending connect attempt
        await this.connectHandle;
        this.isConnected = true;
      } catch (e) {
        // We allow multiple calls to (retries!) to `connect()` even in case where one succeeded
        // if `isConnected` is false (e.g. a prior attempt failed)
        this.isConnected = false;
        throw e;
      } finally {
        this.connectHandle = null;
      }
      return this.isConnected;
    }

    return true;
  }

  get litContracts(): LitContracts {
    return this.contractsInstance;
  }
}
