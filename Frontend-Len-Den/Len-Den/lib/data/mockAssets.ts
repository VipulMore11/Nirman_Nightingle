export interface Asset {
  id: string;
  name: string;
  category: 'real-estate' | 'gold' | 'art' | 'startup' | 'commodities';
  location: string;
  description: string;
  totalValue: number;
  pricePerUnit: number;
  totalUnits: number;
  unitsAvailable: number;
  riskScore: number; // 1-10
  expectedAnnualROI: number;
  image: string;
  legalDocuments: {
    title: string;
    url: string;
  }[];
  dividendFrequency: 'monthly' | 'quarterly' | 'annually';
  nextDividendDate: string;
  description_long: string;
}

export const mockAssets: Asset[] = [
  {
    id: 'asset-001',
    name: 'Mumbai Tech Park - Office Complex',
    category: 'real-estate',
    location: 'Bandra, Mumbai, India',
    description: 'Premium commercial office space in tech hub',
    totalValue: 50000000,
    pricePerUnit: 500,
    totalUnits: 100000,
    unitsAvailable: 25000,
    riskScore: 3,
    expectedAnnualROI: 8.5,
    image: '/images/office-complex.jpg',
    legalDocuments: [
      { title: 'Title Deed', url: '#' },
      { title: 'Legal Opinion', url: '#' },
      { title: 'Valuation Report', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'A state-of-the-art office complex located in the heart of Mumbai\'s technology hub. The property features modern infrastructure, flexible workspace solutions, and proximity to major business centers. Estimated rental yield of 8.5% annually with strong appreciation potential.',
  },
  {
    id: 'asset-002',
    name: 'Singapore Prime Land Development',
    category: 'real-estate',
    location: 'Marina Bay, Singapore',
    description: 'Premium land for mixed-use development',
    totalValue: 75000000,
    pricePerUnit: 1000,
    totalUnits: 75000,
    unitsAvailable: 15000,
    riskScore: 4,
    expectedAnnualROI: 9.2,
    image: '/images/land-development.jpg',
    legalDocuments: [
      { title: 'Land Title', url: '#' },
      { title: 'Development Plan', url: '#' },
      { title: 'Environmental Clearance', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Premium land parcel in Marina Bay area earmarked for mixed-use development. Located in one of Asia\'s most developed regions with strong growth potential. Expected to commence development phase in Q3 2024.',
  },
  {
    id: 'asset-003',
    name: 'Swiss Gold Portfolio',
    category: 'gold',
    location: 'Zurich, Switzerland',
    description: 'Physical gold bullion held in secure vault',
    totalValue: 30000000,
    pricePerUnit: 100,
    totalUnits: 300000,
    unitsAvailable: 50000,
    riskScore: 2,
    expectedAnnualROI: 5.0,
    image: '/images/gold-bullion.jpg',
    legalDocuments: [
      { title: 'Gold Certificate', url: '#' },
      { title: 'Vault Insurance', url: '#' },
      { title: 'Purity Report', url: '#' },
    ],
    dividendFrequency: 'annually',
    nextDividendDate: '2024-12-31',
    description_long:
      'Investment-grade gold bullion held in a secure Swiss vault. Provides portfolio diversification and acts as a hedge against economic uncertainty. Physical gold with 99.99% purity certification.',
  },
  {
    id: 'asset-004',
    name: 'Modern Art Collection Fund',
    category: 'art',
    location: 'London, United Kingdom',
    description: 'Curated collection of contemporary artworks',
    totalValue: 20000000,
    pricePerUnit: 200,
    totalUnits: 100000,
    unitsAvailable: 30000,
    riskScore: 6,
    expectedAnnualROI: 12.0,
    image: '/images/art-collection.jpg',
    legalDocuments: [
      { title: 'Collection Inventory', url: '#' },
      { title: 'Authenticity Certificates', url: '#' },
      { title: 'Insurance Certificate', url: '#' },
    ],
    dividendFrequency: 'annually',
    nextDividendDate: '2024-12-31',
    description_long:
      'Professionally curated collection of contemporary artworks from emerging and established artists. Stored in climate-controlled gallery. Historical appreciation rate of 12% annually with lower volatility compared to individual pieces.',
  },
  {
    id: 'asset-005',
    name: 'TechFlow AI - Series B Equity',
    category: 'startup',
    location: 'San Francisco, USA',
    description: 'AI-powered enterprise software startup',
    totalValue: 100000000,
    pricePerUnit: 2000,
    totalUnits: 50000,
    unitsAvailable: 8000,
    riskScore: 7,
    expectedAnnualROI: 25.0,
    image: '/images/startup-tech.jpg',
    legalDocuments: [
      { title: 'Share Certificate', url: '#' },
      { title: 'Investment Agreement', url: '#' },
      { title: 'Cap Table', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Series B investment in a high-growth AI software company. The startup provides enterprise AI solutions to Fortune 500 companies. Current valuation at $100M with significant runway and growing revenue stream.',
  },
  {
    id: 'asset-006',
    name: 'Agricultural Land - Organic Farming',
    category: 'real-estate',
    location: 'Madhya Pradesh, India',
    description: 'Certified organic farming land',
    totalValue: 15000000,
    pricePerUnit: 300,
    totalUnits: 50000,
    unitsAvailable: 12000,
    riskScore: 4,
    expectedAnnualROI: 7.5,
    image: '/images/agricultural-land.jpg',
    legalDocuments: [
      { title: 'Land Title', url: '#' },
      { title: 'Organic Certification', url: '#' },
      { title: 'Crop Yield Analysis', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Certified organic farming land producing high-value crops. Yields consistent returns through crop sales and agricultural subsidy programs. Sustainable farming practices ensure long-term productivity.',
  },
  {
    id: 'asset-007',
    name: 'Renewable Energy - Solar Farm',
    category: 'commodities',
    location: 'Rajasthan, India',
    description: '50MW solar power generation facility',
    totalValue: 80000000,
    pricePerUnit: 800,
    totalUnits: 100000,
    unitsAvailable: 20000,
    riskScore: 3,
    expectedAnnualROI: 11.0,
    image: '/images/solar-farm.jpg',
    legalDocuments: [
      { title: 'Power Purchase Agreement', url: '#' },
      { title: 'Environmental Permit', url: '#' },
      { title: 'Technical Report', url: '#' },
    ],
    dividendFrequency: 'monthly',
    nextDividendDate: '2024-05-31',
    description_long:
      'Grid-connected solar farm generating renewable energy with 20-year government power purchase agreement. Consistent monthly returns from electricity sales. Strong ESG credentials and government incentives.',
  },
  {
    id: 'asset-008',
    name: 'Dubai Luxury Residential Tower',
    category: 'real-estate',
    location: 'Downtown Dubai, UAE',
    description: 'High-end residential development project',
    totalValue: 120000000,
    pricePerUnit: 1500,
    totalUnits: 80000,
    unitsAvailable: 10000,
    riskScore: 5,
    expectedAnnualROI: 10.0,
    image: '/images/residential-tower.jpg',
    legalDocuments: [
      { title: 'Property Registration', url: '#' },
      { title: 'Completion Certificate', url: '#' },
      { title: 'Management Agreement', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Luxury residential tower in prestigious Downtown Dubai location. Under construction with strong pre-lease demand. Expected ROI driven by rental income and property appreciation.',
  },
  {
    id: 'asset-009',
    name: 'Heritage Property - Historic Building',
    category: 'real-estate',
    location: 'Paris, France',
    description: 'Historic building with heritage status',
    totalValue: 45000000,
    pricePerUnit: 750,
    totalUnits: 60000,
    unitsAvailable: 8000,
    riskScore: 4,
    expectedAnnualROI: 6.5,
    image: '/images/heritage-property.jpg',
    legalDocuments: [
      { title: 'Heritage Certificate', url: '#' },
      { title: 'Property Title', url: '#' },
      { title: 'Restoration Plan', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Magnificent heritage property in central Paris. Protected status ensures long-term value. Generates income from cultural events and guided tours. Appreciation potential through restoration value.',
  },
  {
    id: 'asset-010',
    name: 'Tech Campus - IT Park',
    category: 'real-estate',
    location: 'Bangalore, India',
    description: 'Modern IT park with premium facilities',
    totalValue: 60000000,
    pricePerUnit: 600,
    totalUnits: 100000,
    unitsAvailable: 35000,
    riskScore: 3,
    expectedAnnualROI: 8.8,
    image: '/images/it-park.jpg',
    legalDocuments: [
      { title: 'Land Title', url: '#' },
      { title: 'Building Permit', url: '#' },
      { title: 'Occupancy Certificate', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'State-of-the-art IT park in Bangalore serving as office space for multiple tech companies. High occupancy rate with strong demand from expanding tech firms. Premium amenities and security features.',
  },
  {
    id: 'asset-011',
    name: 'Cryptocurrency Index Fund',
    category: 'commodities',
    location: 'Switzerland',
    description: 'Diversified crypto asset index',
    totalValue: 35000000,
    pricePerUnit: 350,
    totalUnits: 100000,
    unitsAvailable: 25000,
    riskScore: 8,
    expectedAnnualROI: 20.0,
    image: '/images/crypto-fund.jpg',
    legalDocuments: [
      { title: 'Fund Prospectus', url: '#' },
      { title: 'Asset Custody Agreement', url: '#' },
      { title: 'Audit Report', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Professionally managed index fund tracking top cryptocurrency assets with institutional-grade custody. Diversified across major coins to reduce volatility.',
  },
  {
    id: 'asset-012',
    name: 'Global Infrastructure Fund',
    category: 'commodities',
    location: 'Luxembourg',
    description: 'Infrastructure assets across multiple regions',
    totalValue: 250000000,
    pricePerUnit: 2500,
    totalUnits: 100000,
    unitsAvailable: 30000,
    riskScore: 3,
    expectedAnnualROI: 9.5,
    image: '/images/infrastructure-fund.jpg',
    legalDocuments: [
      { title: 'Fund Prospectus', url: '#' },
      { title: 'Asset Listing', url: '#' },
      { title: 'Performance Report', url: '#' },
    ],
    dividendFrequency: 'quarterly',
    nextDividendDate: '2024-06-30',
    description_long:
      'Diversified fund investing in toll roads, airports, and utility assets across developed markets. Inflation-linked returns with predictable cash flows.',
  },
];
