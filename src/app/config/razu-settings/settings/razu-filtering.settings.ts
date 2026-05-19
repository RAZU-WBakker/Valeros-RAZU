import { DateRangeFilterComponent } from '../../../components/features/filters/custom-filters/date-range-filter/date-range-filter.component';
import { FilteringSettings } from '../../../models/settings/filtering-settings.model';
import { DateRangeFilterService } from '../../../services/search/custom-filters/razu/date-range-filter.service';
import { filteringSettings } from '../../default-settings/settings/filtering.settings';

const hideFilterOptionValueIds: string[] = [
  'https://data.razu.nl/def/ldto/ChecksumGegevens',
  'https://data.razu.nl/def/ldto/begripBegrippenlijst',
  'https://data.razu.nl/def/ldto/verwijzingIdentificatie',
  'https://data.razu.nl/def/ldto/GerelateerdInformatieobjectGegevens',
  'https://data.razu.nl/def/ldto/Object',
  'https://data.razu.nl/def/ldto/DekkingInTijdGegevens',
  'https://data.razu.nl/def/ldto/VerwijzingGegevens',
  'https://data.razu.nl/def/ldto/BegripGegevens',
  'https://data.razu.nl/def/ldto/IdentificatieGegevens',
  'https://data.razu.nl/def/ldto/BetrokkeneGegevens',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_7f9dffa7',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_42e406dd',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_f90465b3',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_7f9dffa10',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_3d782f30',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_de27ae7a',
  'https://identifier.overheid.nl/tooi/def/thes/kern/c_dfa0ff1f',
];

export const razuFilteringSettings: FilteringSettings = {
  ...filteringSettings,
  filterOptions: {
    type: {
      label: 'Type',
      fieldIds: ['type.keyword'],
      values: [],
      hideValueIds: [...hideFilterOptionValueIds],
    },
    location: {
      label: 'Straat',
      fieldIds: ['location.keyword'],
      values: [],
      hideValueIds: [],
    },
    date: {
      label: 'Datering',
      fieldIds: ['startDate.keyword'],
      values: [],
      hideValueIds: [...hideFilterOptionValueIds],
    },
    researched: {
      label: 'Onderzocht',
      fieldIds: ['researched.keyword'],
      values: [],
      hideValueIds: [...hideFilterOptionValueIds],
    }
  },
  clearButtonExcludedFilterIds: ['type'],
};
