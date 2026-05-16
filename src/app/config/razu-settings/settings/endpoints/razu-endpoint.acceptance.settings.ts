import { EndpointSettings } from '../../../../models/settings/endpoint-settings.model';
import { endpointSettings } from '../../../default-settings/settings/endpoint.settings';

export const razuEndpointSettings: EndpointSettings = {
  ...endpointSettings,
  data: {
    razu: {
      label: 'Regionaal Archief Zuid-Utrecht',
      endpointUrls: [
        {
          elastic: 'https://ontwikkel.search.razu.nl/ldto/_search',
          // sparql: 'https://api.data.razu.nl/datasets/id/object/sparql',
          sparql: 'http://min:8890/sparql/',
        },
      ],
    },
  },
  pdfConversionUrl: 'https://ontwikkel.viewer.razu.nl/gotenberg/convert?url=',
  urlProcessor: {
    url: 'https://huizenenmenseninwijk.nl/process-url', // Used for token generation, see https://github.com/Regionaal-Archief-Zuid-Utrecht/SURA
    matchSubstring: 'opslag.huizenenmenseninwijk.nl',
  },
  snippetServer: 'https://ontwikkel.viewer.razu.nl/snippet',
  proxyUrl: 'https://huizenenmenseninwijk.nl/cors-proxy',
};