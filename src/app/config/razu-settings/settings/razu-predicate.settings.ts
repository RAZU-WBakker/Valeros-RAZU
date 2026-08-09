import { PredicateSettings } from '../../../models/settings/predicate-settings.model';
import {
  filePredicates,
  labelPredicates,
  parentPredicates,
  typePredicates,
} from '../../default-settings/settings/predicate.settings';

export const razuTypePredicates: string[] = [
  'type',
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
];

export const razuLabelPredicates: string[] = [
  'name',
  'description',
  'naam',
  'https://data.razu.nl/def/ldto/naam',
  'https://data.razu.nl/def/ldto/begripLabel',
  'https://data.razu.nl/def/ldto/verwijzingNaam',
  'https://data.razu.nl/def/ldto/identificatieKenmerk',
  'http://schema.org/copyrightNotice',
  'https://schema.org/name',
  'https://w3id.org/italia/onto/CLV/officialStreetName',
  'https://w3id.org/italia/onto/CLV/fullAddress',
  'https://schema.org/headline',
  'http://www.w3.org/2000/01/rdf-schema#label',
];

export const razuParentPredicates: string[] = [
  // Disabled for custom index - no hierarchical structure
];

export const razuFilePredicates: string[] = [
  'url_bestand',
];

export const razuHopFilePredicates: string[][] = [
  // Disabled for custom index
];

export const razuPredicateSettings: PredicateSettings = {
  parents: razuParentPredicates,
  label: razuLabelPredicates,
  type: razuTypePredicates,
  files: razuFilePredicates,
  hopFiles: razuHopFilePredicates,
};
