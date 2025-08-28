import {
  PredicateVisibility,
  PredicateVisibilitySettings,
} from '../../../models/settings/predicate-visibility-settings.model';
import { ViewMode } from '../../../models/view-mode.enum';
import { predicateVisibilitySettings } from '../../default-settings/settings/predicate-visibility.settings';
import {
  filePredicates,
  parentPredicates,
  typePredicates,
} from '../../default-settings/settings/predicate.settings';

export const razuPredicateVisibilitySettings: PredicateVisibilitySettings = {
  byViewMode: {
    [ViewMode.List]: {
      [PredicateVisibility.Show]: [
        {
          predicates: [
            // 'aggregatieniveau',
            // 'archief',
            // 'classificatie',
            // 'archiefvormer',
            'locatie'
          ],
        },
      ],
      [PredicateVisibility.Details]: [
        {
          predicates: [
            ...filePredicates,
            'https://data.razu.nl/def/ldto/heeftRepresentatie',
            'https://data.razu.nl/def/ldto/dekkingInRuimte',
            'https://data.razu.nl/def/ldto/dekkingInTijd',
            'https://data.razu.nl/def/ldto/naam',
            'https://data.razu.nl/def/ldto/omschrijving',
            'https://data.razu.nl/def/ldto/URLBestand',
            '*',
          ],
        },
      ],
      [PredicateVisibility.Hide]: [
        {
          predicates: [
            ...typePredicates,
            ...parentPredicates,
            'https://data.razu.nl/def/ldto/aggregatieniveau',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_7f9dffa7',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_42e406dd',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_f90465b3',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_7f9dffa10',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_3d782f30',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_de27ae7a',
            'https://identifier.overheid.nl/tooi/def/thes/kern/c_dfa0ff1f',
            'https://huizenenmenseninwijk.nl/def/hemiw/mensengeschiedenis',
            'https://huizenenmenseninwijk.nl/def/hemiw/bouwgeschiedenis',
            'https://huizenenmenseninwijk.nl/def/hemiw/primaryimage',
            'https://schema.org/image',
          ],
        },
      ],
    },
    [ViewMode.Grid]: {
      [PredicateVisibility.Show]: [],
      [PredicateVisibility.Details]: [{ predicates: ['*'] }],
      [PredicateVisibility.Hide]: [],
    },
  },
  alwaysHide: [
    ...predicateVisibilitySettings.alwaysHide,
    'https://data.razu.nl/def/ldto/aggregatieniveau',
    'https://data.razu.nl/def/ldto/checksum',
    'https://data.razu.nl/def/ldto/waardering',
    'https://schema.org/breadcrumb',
    'http://schema.org/mainEntity',
    'http://purl.org/dc/terms/hasFormat',
    'https://data.razu.nl/def/ldto/seo',
    'https://data.razu.nl/def/ldto/onderdeelVan',
    'https://w3id.org/italia/onto/CLV/fullAddress',

  ],
  hideTypeBadges: [
    'https://data.razu.nl/def/ldto/BeperkingGebruikGegevens',
    'https://data.razu.nl/def/ldto/DekkingInTijdGegevens',
    'https://data.razu.nl/def/ldto/IdentificatieGegevens',
    'https://data.razu.nl/def/ldto/Informatieobject',
    'https://data.razu.nl/def/ldto/EventGegevens',
  ],
};
