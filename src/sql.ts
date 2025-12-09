import {
  PglCreateAccountOpts,
  PglCreateTransferOpts,
  PglId,
  PglSqlQueryParams,
  PglTransferQueryOpts,
} from "./types";

export class PglSql {
  private readonly PREFIX = "pgledger";
  private readonly ACCOUNTS_VIEW = `${this.PREFIX}_accounts_view`;
  private readonly TRANSFER_VIEW = `${this.PREFIX}_transfers_view`;
  private readonly CREATE_ACCOUNT_FUNC = `${this.PREFIX}_create_account`;
  private readonly CREATE_TRANSFER_FUNC = `${this.PREFIX}_create_transfer`;
  private readonly CREATE_TRANSFERS_FUNC = `${this.PREFIX}_create_transfers`;

  public createAccount(opts: PglCreateAccountOpts): PglSqlQueryParams {
    return [
      `SELECT id FROM ${this.CREATE_ACCOUNT_FUNC}(?,?,?,?)`,
      {
        replacements: [
          opts.name,
          opts.currency,
          opts.allowNegativeBalances ?? true,
          opts.allowPositiveBalances ?? true,
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

  public createTransfer(opts: PglCreateTransferOpts): PglSqlQueryParams {
    return [
      `SELECT id FROM ${this.CREATE_TRANSFER_FUNC}(?,?,?,?,?)`,
      {
        replacements: [
          opts.accountId1,
          opts.accountId2,
          opts.amount,
          opts.eventAt ?? null,
          opts.metadata ?? null,
        ],
      },
    ];
  }

  public createTransfers(
    opts: Omit<PglCreateTransferOpts, "metaData" | "eventAt">[]
  ): PglSqlQueryParams {
    const transferRows = opts.map(
      (opt) =>
        `ROW('${opt.accountId1}', '${opt.accountId2}', ${opt.amount})::TRANSFER_REQUEST`
    );

    const transfers = `ARRAY[${transferRows.join(", ")}]`;

    return [`SELECT id FROM ${this.CREATE_TRANSFERS_FUNC}(${transfers})`, {}];
  }

  public queryTransfers(opts: PglTransferQueryOpts): PglSqlQueryParams {
    const conditions: string[] = [];
    const replacements: Record<string, unknown> = {};

    if (opts.fromAccountId) {
      conditions.push(`from_account_id = :fromAccountId`);
      replacements.fromAccountId =
        typeof opts.fromAccountId === "object"
          ? opts.fromAccountId.id
          : opts.fromAccountId;
    }

    if (opts.toAccountId) {
      conditions.push(`to_account_id = :toAccountId`);
      replacements.toAccountId =
        typeof opts.toAccountId === "object"
          ? opts.toAccountId.id
          : opts.toAccountId;
    }

    if (opts.dateFrom) {
      conditions.push(`created_at >= :dateFrom`);
      replacements.dateFrom = opts.dateFrom;
    }

    if (opts.dateTo) {
      conditions.push(`created_at <= :dateTo`);
      replacements.dateTo = opts.dateTo;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const order =
      opts.order === "ASC" || opts.order === "DSC"
        ? `ORDER BY id ${opts.order === "DSC" ? "DESC" : "ASC"}`
        : `ORDER BY id DESC`;

    if (opts.limit) replacements.limit = opts.limit ?? 50;
    if (opts.skip) replacements.skip = opts.skip ?? 0;

    return [
      `SELECT
        id,
        from_account_id,
        to_account_id,
        amount,
        created_at,
        event_at,
        metadata FROM ${this.TRANSFER_VIEW}
        ${where}
        ${order}
        LIMIT :limit
        OFFSET :skip
      `,
      replacements,
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
