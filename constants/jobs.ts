export type JobOffer = {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  contract: 'CDI' | 'CDD' | 'Freelance' | 'Stage';
  salary: string;
  postedAt: string;
  remoteType: 'Télétravail' | 'Hybride' | 'Présentiel';
  tags: string[];
  description: string;
};

export const jobOffers: JobOffer[] = [
  {
    id: 'job-1',
    title: 'Product Designer Senior',
    company: 'HelloWork',
    companyId: 'company-hellowork',
    location: 'Paris (75)',
    contract: 'CDI',
    salary: '55 - 65 k€',
    postedAt: 'Publié il y a 2 heures',
    remoteType: 'Hybride',
    tags: ['Figma', 'Design System', 'User Research'],
    description:
      "Rejoignez l'équipe produit pour concevoir des expériences utilisateur accessibles et inclusives.",
  },
  {
    id: 'job-2',
    title: 'Product Manager Confirmé',
    company: 'ScaleUp Labs',
    companyId: 'company-scaleup',
    location: 'Lille (59)',
    contract: 'CDI',
    salary: '60 - 70 k€',
    postedAt: 'Publié hier',
    remoteType: 'Télétravail',
    tags: ['Agile', 'Roadmap', 'Discovery'],
    description:
      'Pilotez la stratégie produit avec une équipe pluridisciplinaire et des cycles de livraison courts.',
  },
  {
    id: 'job-3',
    title: 'Lead Product Designer',
    company: 'RetailX',
    companyId: 'company-retailx',
    location: 'Lyon (69)',
    contract: 'CDI',
    salary: '65 - 75 k€',
    postedAt: 'Publié il y a 3 jours',
    remoteType: 'Hybride',
    tags: ['Leadership', 'Design Ops', 'UX Strategy'],
    description:
      'Structurez et animez la vision design pour un acteur majeur du e-commerce français.',
  },
  {
    id: 'job-4',
    title: 'UX Researcher',
    company: 'SaaSly',
    companyId: 'company-saasly',
    location: 'Télétravail',
    contract: 'CDI',
    salary: '45 - 55 k€',
    postedAt: 'Publié cette semaine',
    remoteType: 'Télétravail',
    tags: ['Interviews', 'Data', 'Testing'],
    description:
      'Définissez et pilotez les programmes de recherche utilisateur pour orienter les décisions produit.',
  },
  {
    id: 'job-5',
    title: 'Product Owner',
    company: 'GreenTech',
    companyId: 'company-greentech',
    location: 'Bordeaux (33)',
    contract: 'CDD',
    salary: '42 - 48 k€',
    postedAt: 'Publié il y a 5 jours',
    remoteType: 'Hybride',
    tags: ['Backlog', 'User Stories', 'Scrum'],
    description:
      'Accompagnez la transformation numérique des acteurs de la transition écologique.',
  },
  {
    id: 'job-6',
    title: 'Product Designer Junior',
    company: 'Nova Studio',
    companyId: 'company-nova',
    location: 'Rennes (35)',
    contract: 'Stage',
    salary: '1 200 € / mois',
    postedAt: 'Publié cette semaine',
    remoteType: 'Présentiel',
    tags: ['UI', 'Prototypage', 'Design Sprint'],
    description:
      "Participez à la conception d'expériences mobiles innovantes pour des clients grand public.",
  },
];

export const highlightedTopics = [
  {
    id: 'topic-1',
    title: 'Découvrir les tendances 2025',
    description: 'Tout savoir sur les salaires et les compétences les plus recherchées.',
  },
  {
    id: 'topic-2',
    title: 'Booster mon CV',
    description: 'Nos conseils pour passer les filtres recruteurs et ATS.',
  },
  {
    id: 'topic-3',
    title: 'Réussir son entretien produit',
    description: 'Préparez vos études de cas et ateliers collaboratifs.',
  },
];

