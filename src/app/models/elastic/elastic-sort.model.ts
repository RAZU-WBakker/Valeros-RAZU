export type ElasticSortEntryModel =
  | {
    [fieldId: string]: {
      order: ElasticSortOrder;
      unmapped_type: string;
    };
  }
  | {
    _script: {
      type: 'string' | 'number';
      order: ElasticSortOrder;
      script: {
        lang: 'painless';
        source: string;
        params?: { [key: string]: any };
      };
    };
  };

export type ElasticSortOrder = 'asc' | 'desc';
