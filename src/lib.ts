import { Options as SequelizeOptions, Sequelize } from "sequelize";
import {
  PglCreateAccountOpts,
  PglCreateTransferOpts,
  PglDbAccount,
  PglDbOpts,
  PglDbTransfer,
  PglId,
  PglSqlQueryParams,
  PglTransferQueryOpts,
} from "./types";
import { PglSql } from "./sql";
import { PglAccount, PglTransfer } from "./models";

export class PGLedger {
  private readonly _seq: Sequelize;
  private readonly _sql: PglSql;

  /**
   * Use for initializing a PGLedger instance
   * @param dbOpts
   * @returns
   */
  public static async init(dbOpts: PglDbOpts): Promise<PGLedger> {
    const instance = new PGLedger(dbOpts);
    await instance.authenticateDb();

    return instance;
  }

  /**
   *
   * @param dbOpts Sequelize conn info
   */
  constructor(dbOpts: PglDbOpts) {
    const postgresDbOpts: SequelizeOptions = {
      ...dbOpts,
      dialect: "postgres",
      logging: false,
    };

    this._seq = new Sequelize(postgresDbOpts);
    this._sql = new PglSql();
  }

  /**
   * Checks that Db connection is established
   * @returns
   */
  public authenticateDb(): Promise<void> {
    return this._seq.authenticate();
  }

  /**
   * Destroys Db connection
   * @returns
   */
  public destroy(): Promise<void> {
    return this._seq.close();
  }

  private async _queryAndReturnFirst<R>(params: PglSqlQueryParams): Promise<R> {
    const result = await this._seq.query(...params);
    const firstResult = result[0].at(0) as R | undefined;
    if (!firstResult) {
      throw new Error(`no result returned for query: ${params[0]}`);
    }

    return firstResult;
  }

  private async _query<R>(params: PglSqlQueryParams): Promise<R[]> {
    const result = await this._seq.query(...params);
    return result[0] as R[];
  }
  /**
   *
   * @param name
   * @param currency
   * @param allowNegativeBalances
   * @param allowPositiveBalances
   */
  public async createAccount(
    name: string,
    currency: string,
    allowNegativeBalances?: boolean,
    allowPositiveBalances?: boolean
  ): Promise<PglId>;
  /**
   *
   * @param opts
   */
  public async createAccount(opts: PglCreateAccountOpts): Promise<PglId>;
  public async createAccount(
    p1: string | PglCreateAccountOpts,
    p2?: string,
    p3?: boolean,
    p4?: boolean
  ): Promise<PglId> {
    let opts: PglCreateAccountOpts;
    if (typeof p1 === "string" && typeof p2 === "string") {
      opts = {
        name: p1,
        currency: p2,
        allowNegativeBalances: p3,
        allowPositiveBalances: p4,
      };
    } else if (typeof p1 === "object") {
      opts = p1;
    } else {
      throw new Error(
        "you should provide name and currency or complete create account options object"
      );
    }

    const query = this._sql.createAccount(opts);
    const result = await this._queryAndReturnFirst<{ id: PglId }>(query);

    return result.id;
  }

  public async lookup(ids: PglId[]): Promise<PglAccount[]> {
    const query = this._sql.lookup(ids);
    const result = await this._query<PglDbAccount>(query);

    const accounts: PglAccount[] = [];
    for (const row of result) {
      accounts.push(new PglAccount(row));
    }

    return accounts;
  }

  public async createTransfer(opts: PglCreateTransferOpts): Promise<PglId>;
  public async createTransfer(
    account1: PglAccount | PglCreateTransferOpts,
    account2?: PglAccount,
    amount?: string,
    eventAt?: Date,
    metadata?: Record<string, unknown>
  ): Promise<PglId>;
  public async createTransfer(
    accountId1: PglId | PglCreateTransferOpts,
    accountId2?: PglId,
    amount?: string,
    eventAt?: Date,
    metadata?: Record<string, unknown>
  ): Promise<PglId>;
  public async createTransfer(
    acc1: PglId | PglAccount | PglCreateTransferOpts,
    acc2?: PglId | PglAccount,
    amount?: string,
    eventAt?: Date,
    metadata?: Record<string, unknown>
  ): Promise<PglId> {
    let opts: PglCreateTransferOpts;
    let accountId1;
    let accountId2;
    if (typeof acc1 === "object" && !(acc1 instanceof PglAccount)) {
      opts = acc1;
    } else {
      accountId1 = acc1 instanceof PglAccount ? acc1.id : acc1;
      accountId2 = acc2 instanceof PglAccount ? acc2.id : acc2;

      if (
        typeof accountId1 === "string" &&
        typeof accountId2 === "string" &&
        typeof amount === "string"
      ) {
        opts = {
          accountId1: accountId1,
          accountId2: accountId2,
          amount: amount,
          eventAt: eventAt,
          metadata: metadata,
        };
      } else {
        throw new Error(
          "you should provide accountId1 and accountId2 and amount or complete create transfer options object"
        );
      }
    }

    const query = this._sql.createTransfer(opts);
    const transferId = await this._queryAndReturnFirst<{ id: PglId }>(query);

    return transferId.id;
  }

  public async createTransfers(
    opts: PglCreateTransferOpts[]
  ): Promise<PglId[]> {
    if (!opts.length) {
      throw new Error(
        "you should provide at least one create transfer option object"
      );
    }

    const query = this._sql.createTransfers(opts);

    const transfers = await this._query<{ id: PglId }>(query);

    const transferIds: PglId[] = [];
    for (const t of transfers) {
      transferIds.push(t.id);
    }

    return transferIds;
  }

  public async allAccountTransfers(pglId: PglId): Promise<PglTransfer[]> {
    const query = this._sql.allAccountTransfers(pglId);

    const result = await this._query<PglDbTransfer>(query);

    const transfers: PglTransfer[] = [];
    for (const row of result) {
      transfers.push(new PglTransfer(row));
    }

    return transfers;
  }

  public async queryTransfers(
    opts?: PglTransferQueryOpts
  ): Promise<PglTransfer[]> {
    const query = this._sql.queryTransfers(opts ?? {});

    const transfers = await this._query<PglTransfer>(query);
    return transfers;
  }

  public async lookupTransfers(ids: PglId[]): Promise<PglTransfer[]> {
    const query = this._sql.lookupTransfers(ids);
    const result = await this._query<PglDbTransfer>(query);

    const accounts: PglTransfer[] = [];
    for (const row of result) {
      accounts.push(new PglTransfer(row));
    }

    return accounts;
  }
}
