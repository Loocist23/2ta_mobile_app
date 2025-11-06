export type Company = {
  id: string;
  name: string;
  location: string;
  description: string;
  industry: string;
  employees: string;
  website: string;
  culture: string[];
  openRoles: number;
};

export const partnerCompanies: Company[] = [
  {
    id: 'company-hellowork',
    name: 'HelloWork',
    location: 'Rennes, France',
    description:
      "Leader français des solutions digitales pour l'emploi, HelloWork accompagne candidats et recruteurs.",
    industry: 'Tech RH',
    employees: '500 - 1 000',
    website: 'https://www.hellowork.com',
    culture: ['Impact positif', 'Innovation continue', 'Télétravail flexible'],
    openRoles: 4,
  },
  {
    id: 'company-backmarket',
    name: 'Back Market',
    location: 'Paris, France',
    description:
      'Marketplace leader des produits reconditionnés, Back Market oeuvre pour une tech plus durable.',
    industry: 'E-commerce',
    employees: '1 000 - 2 000',
    website: 'https://www.backmarket.fr',
    culture: ['Impact environnemental', 'Culture produit forte', 'Scale-up internationale'],
    openRoles: 6,
  },
  {
    id: 'company-doctolib',
    name: 'Doctolib',
    location: 'Paris, France',
    description:
      'Doctolib développe les services numériques de santé utilisés par des millions de patients et praticiens.',
    industry: 'HealthTech',
    employees: '2 000 - 5 000',
    website: 'https://www.doctolib.fr',
    culture: ['Patient-first', 'Collaboration', 'Carrière internationale'],
    openRoles: 3,
  },
  {
    id: 'company-qonto',
    name: 'Qonto',
    location: 'Paris, France',
    description:
      'La néobanque Qonto aide les PME et indépendants à simplifier leur gestion financière quotidienne.',
    industry: 'FinTech',
    employees: '1 000 - 2 000',
    website: 'https://qonto.com',
    culture: ['Customer care', 'Exigence', 'Autonomie'],
    openRoles: 2,
  },
];

export const companies: Company[] = [
  ...partnerCompanies,
  {
    id: 'company-scaleup',
    name: 'ScaleUp Labs',
    location: 'Lille, France',
    description:
      'ScaleUp Labs accélère la croissance de produits B2B grâce à une expertise produit et data.',
    industry: 'SaaS B2B',
    employees: '200 - 500',
    website: 'https://scaleuplabs.example.com',
    culture: ['Culture data', 'Autonomie', 'Remote friendly'],
    openRoles: 5,
  },
  {
    id: 'company-retailx',
    name: 'RetailX',
    location: 'Lyon, France',
    description:
      'RetailX modernise le e-commerce des grandes enseignes avec une plateforme omnicanale.',
    industry: 'RetailTech',
    employees: '500 - 1 000',
    website: 'https://retailx.example.com',
    culture: ['Expérience client', 'Design centric', 'Innovation continue'],
    openRoles: 3,
  },
  {
    id: 'company-saasly',
    name: 'SaaSly',
    location: 'Remote, Europe',
    description:
      'SaaSly développe une suite d’outils collaboratifs pour les équipes produit à travers le monde.',
    industry: 'Collaboration',
    employees: '100 - 200',
    website: 'https://saasly.example.com',
    culture: ['100% remote', 'Culture produit', 'Rythme durable'],
    openRoles: 4,
  },
  {
    id: 'company-greentech',
    name: 'GreenTech',
    location: 'Bordeaux, France',
    description:
      'GreenTech accompagne la transition écologique avec des solutions numériques pour l’énergie.',
    industry: 'GreenTech',
    employees: '300 - 600',
    website: 'https://greentech.example.com',
    culture: ['Transition écologique', 'Impact terrain', 'Innovation locale'],
    openRoles: 2,
  },
  {
    id: 'company-nova',
    name: 'Nova Studio',
    location: 'Rennes, France',
    description:
      'Nova Studio conçoit des expériences mobiles premium pour des marques grand public.',
    industry: 'Design Agency',
    employees: '50 - 100',
    website: 'https://novastudio.example.com',
    culture: ['Studio créatif', 'Mentorat', 'Présentiel'],
    openRoles: 1,
  },
];
