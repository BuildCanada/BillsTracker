import type { ApiBillDetail } from '@/services/billApi';

export const mockBillResponses: Record<string, ApiBillDetail> = {
  'S-230': {
    billID: 'S-230',
    title: 'An Act respecting the development of a national strategy for soil health protection, conservation and enhancement',
    shortTitle: 'National Strategy for Soil Health Act',
    header: 'This enactment requires the Minister of Agriculture and Agri-Food to develop a national strategy',
    summary: 'This enactment requires the Minister of Agriculture and Agri-Food to develop a national strategy to support and promote efforts across Canada to protect, conserve and enhance the health of soil.',
    genres: ['Agriculture', 'Environment'],
    date: '2025-06-10',
    status: 'First Reading',
    stage: 'First Reading',
    sponsorParty: 'Conservative',
    sponsorName: ['Senator BLACK'],
    parliamentNumber: 45,
    sessionNumber: 1,
    source: 'https://www.parl.ca/Content/Bills/451/Private/S-230/S-230_1/S-230_E.xml'
  },
  'S-231': {
    billID: 'S-231',
    title: 'An Act to amend the Canada Business Corporations Act',
    shortTitle: 'Business Corporations Amendment Act',
    header: 'This enactment amends the Canada Business Corporations Act',
    summary: 'This enactment amends the Canada Business Corporations Act to provide corporate transparency.',
    genres: ['Business', 'Corporations'],
    date: '2025-06-11',
    status: 'First Reading',
    stage: 'First Reading',
    sponsorParty: 'Liberal',
    sponsorName: ['Senator SMITH'],
    parliamentNumber: 45,
    sessionNumber: 1,
    source: 'https://www.parl.ca/Content/Bills/451/Private/S-231/S-231_1/S-231_E.xml'
  },
  'C-208': {
    billID: 'C-208',
    title: 'An Act to amend the Income Tax Act (transfer of small business or family farm or fishing corporation)',
    shortTitle: 'Income Tax Amendment Act',
    header: 'This enactment amends the Income Tax Act',
    summary: 'This enactment amends the Income Tax Act to provide for intergenerational business transfers.',
    genres: ['Taxation', 'Small Business'],
    date: '2025-05-15',
    status: 'First Reading',
    stage: 'First Reading',
    sponsorParty: 'Conservative',
    sponsorName: ['MP JONES'],
    parliamentNumber: 45,
    sessionNumber: 1,
    source: 'https://www.parl.ca/Content/Bills/451/Private/C-208/C-208_1/C-208_E.xml'
  },
  'C-206': {
    billID: 'C-206',
    title: 'An Act to amend the Greenhouse Gas Pollution Pricing Act',
    shortTitle: 'Carbon Tax Exemption Act',
    header: 'This enactment amends the Greenhouse Gas Pollution Pricing Act',
    summary: 'This enactment amends the Greenhouse Gas Pollution Pricing Act to provide exemptions for farmers.',
    genres: ['Environment', 'Agriculture', 'Taxation'],
    date: '2025-05-10',
    status: 'First Reading',
    stage: 'First Reading',
    sponsorParty: 'Conservative',
    sponsorName: ['MP BROWN'],
    parliamentNumber: 45,
    sessionNumber: 1,
    source: 'https://www.parl.ca/Content/Bills/451/Private/C-206/C-206_1/C-206_E.xml'
  }
};