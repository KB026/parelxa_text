type QueryResult = {
  data: unknown;
  error: null;
  count?: number;
};

type SingleResult = {
  data: unknown | null;
  error: null;
};

interface NoopQueryBuilder extends PromiseLike<QueryResult> {
  select(...args: unknown[]): NoopQueryBuilder;
  eq(...args: unknown[]): NoopQueryBuilder;
  neq(...args: unknown[]): NoopQueryBuilder;
  or(...args: unknown[]): NoopQueryBuilder;
  in(...args: unknown[]): NoopQueryBuilder;
  overlaps(...args: unknown[]): NoopQueryBuilder;
  ilike(...args: unknown[]): NoopQueryBuilder;
  not(...args: unknown[]): NoopQueryBuilder;
  order(...args: unknown[]): NoopQueryBuilder;
  range(...args: unknown[]): NoopQueryBuilder;
  limit(...args: unknown[]): NoopQueryBuilder;
  gt(...args: unknown[]): NoopQueryBuilder;
  gte(...args: unknown[]): NoopQueryBuilder;
  lt(...args: unknown[]): NoopQueryBuilder;
  lte(...args: unknown[]): NoopQueryBuilder;
  contains(...args: unknown[]): NoopQueryBuilder;
  update(...args: unknown[]): NoopQueryBuilder;
  insert(...args: unknown[]): NoopQueryBuilder;
  upsert(...args: unknown[]): NoopQueryBuilder;
  delete(...args: unknown[]): NoopQueryBuilder;
  single(): Promise<SingleResult>;
  maybeSingle(): Promise<SingleResult>;
}

function createQueryResult(data: unknown[] = [], count: number = 0): Promise<QueryResult> {
  return Promise.resolve({ data, error: null, count });
}

function createNoopBuilder(): NoopQueryBuilder {
  const builder: NoopQueryBuilder = {
    select() { return builder; },
    eq() { return builder; },
    neq() { return builder; },
    or() { return builder; },
    in() { return builder; },
    overlaps() { return builder; },
    ilike() { return builder; },
    not() { return builder; },
    order() { return builder; },
    range() { return builder; },
    limit() { return builder; },
    gt() { return builder; },
    gte() { return builder; },
    lt() { return builder; },
    lte() { return builder; },
    contains() { return builder; },
    update() { return builder; },
    insert() { return builder; },
    upsert() { return builder; },
    delete() { return builder; },
    single() { return Promise.resolve({ data: null, error: null }); },
    maybeSingle() { return Promise.resolve({ data: null, error: null }); },
    then<TResult1 = QueryResult, TResult2 = never>(
      onFulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return createQueryResult().then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export function createNoopSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: null }),
      exchangeCodeForSession: async () => ({ data: { user: null, session: null }, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
    },
    from() {
      return createNoopBuilder();
    },
    rpc() {
      return createQueryResult([], 0);
    },
  } as const;
}

