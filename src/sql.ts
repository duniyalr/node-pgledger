import { PglCreateAccountOpts, PglId, PglSqlQueryParams } from "./types";

export class PglSql {
  private readonly PREFIX = "pgledger";
  private readonly ACCOUNTS_VIEW = `${this.PREFIX}_accounts_view`;
  private readonly TRANSFER_VIEW = `${this.PREFIX}_transfers_view`;
  private readonly CREATE_ACCOUNT_FUNC = `${this.PREFIX}_create_account`;
  private readonly CREATE_TRANSFER_FUNC = `${this.PREFIX}_create_transfer`;

  public createAccount(opts: PglCreateAccountOpts): PglSqlQueryParams {
    return [
      `SELECT id FROM ${this.CREATE_ACCOUNT_FUNC}(?,?,?,?)`,
      {
        replacements: [
          opts.name,
          opts.currency,
          opts.allowNegativeBalances || true,
          opts.allowPositiveBalances || true,
        ],
      },
    ];
  }

  public lookup(ids: PglId[]): PglSqlQueryParams {
    return [
      `SELECT
        id,
        name,
        currency,
        balance,
        version,
        allow_negative_balance,
        allow_positive_balance,
        created_at,
        updated_at FROM ${this.ACCOUNTS_VIEW} WHERE id IN (?)`,
      {
        replacements: [ids],
      },
    ];
  }

  public createTransfer(
    accountId1: PglId,
    accountId2: PglId,
    amount: string,
    eventAt?: Date,
    metadata?: Record<string, unknown>,
  ): PglSqlQueryParams {
    return [
      `SELECT id FROM ${this.CREATE_TRANSFER_FUNC}(?,?,?,?,?)`,
      {
        replacements: [
          accountId1,
          accountId2,
          amount,
          eventAt || null,
          metadata || null,
        ],
      },
    ];
  }

  public lookupTransfers(ids: PglId[]): PglSqlQueryParams {
    return [
      `SELECT
        id,
        from_account_id,
        to_account_id,
        amount,
        created_at,
        event_at,
        metadata FROM ${this.TRANSFER_VIEW} WHERE id IN (?)`,
      {
        replacements: [ids],
      },
    ];
  }
}
