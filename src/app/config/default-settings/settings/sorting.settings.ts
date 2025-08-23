import { SortOrder } from '../../../models/settings/sort-order.enum';
import { SortingSettings } from '../../../models/settings/sorting-settings.model';
import { labelPredicates } from './predicate.settings';
import { FilterType } from '../../../models/filters/filter.model';

export const sortingSettings: SortingSettings = {
  default: 'title-a-z',
  options: {
    relevance: {
      fields: [],
      label: 'Relevantie',
      order: SortOrder.Ascending,
      boost: {
        name: {
          boost: 5,
          filter: {
            type: FilterType.Field,
            fieldIds: ['name'],
            valueIds: [],
          },
        }
      }
    },
    'title-a-z': {
      fields: labelPredicates.map((pred) => pred + '.keyword'),
      label: 'Titel (A-Z)',
      order: SortOrder.Ascending,
      naturalAddress: true,
      boost: {
        name: {
          boost: 3,
          filter: {
            type: FilterType.Field,
            fieldIds: ['name'],
            valueIds: [],
          },
        }
      }
    },
    'title-z-a': {
      fields: labelPredicates.map((pred) => pred + '.keyword'),
      label: 'Titel (Z-A)',
      order: SortOrder.Descending,
      naturalAddress: true,
      boost: {
        name: {
          boost: 3,
          filter: {
            type: FilterType.Field,
            fieldIds: ['name'],
            valueIds: [],
          },
        }
      }
    },
  },
};
