import type { Transaction, Category } from '@/types';

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transport',
  'Housing',
  'Entertainment',
  'Health',
  'Shopping',
  'Salary',
  'Freelance',
  'Investments',
];

export const MERCHANTS = [
  'Whole Foods', 'Trader Joe\'s', 'McDonald\'s', 'Starbucks', 'Chipotle',
  'Uber', 'Lyft', 'Delta Airlines', 'Metro Transit', 'Shell Gas',
  'Rent Payment', 'Electric Company', 'Internet Provider', 'Water Utility',
  'Netflix', 'Spotify', 'Steam', 'AMC Theaters', 'Hulu',
  'CVS Pharmacy', 'Planet Fitness', 'Blue Cross Insurance', 'Walgreens',
  'Amazon', 'Zara', 'Nike', 'Target', 'Best Buy',
  'Employer Inc.', 'Freelance Client A', 'Freelance Client B',
  'Vanguard', 'Fidelity', 'Airbnb',
];

const tx = (
  id: string,
  date: string,
  amount: number,
  category: Category,
  type: 'income' | 'expense',
  description: string,
  merchant: string
): Transaction => {
  const recurringMerchants = new Set([
    'Spotify',
    'Netflix',
    'Planet Fitness',
    'Blue Cross Insurance',
    'Rent Payment',
    'Internet Provider',
    'Electric Company',
    'Water Utility',
    'Vanguard',
    'Fidelity',
  ]);

  const account =
    type === 'income'
      ? 'Checking'
      : category === 'Investments'
        ? 'Brokerage'
        : category === 'Housing'
          ? 'Checking'
          : 'Credit Card';

  const sourceTag =
    type === 'income'
      ? merchant === 'Employer Inc.'
        ? description.toLowerCase().includes('bonus')
          ? 'Bonus'
          : 'Payroll'
        : 'Client Work'
      : undefined;

  const status =
    ['2026-04-24', '2026-04-26', '2026-04-28'].includes(date) && type === 'expense'
      ? 'pending'
      : 'posted';

  return {
    id,
    date,
    amount,
    category,
    type,
    description,
    merchant,
    account,
    status,
    isRecurring:
      recurringMerchants.has(merchant) ||
      description.toLowerCase().includes('monthly subscription') ||
      description.toLowerCase().includes('gym membership') ||
      description.toLowerCase().includes('index fund contribution'),
    sourceTag,
  };
};

export const mockTransactions: Transaction[] = [
  // -- JANUARY 2025 - Stable month (~$2,900 expenses) ------------------
  tx('t001', '2025-11-01', 4800, 'Salary',         'income',  'Monthly salary',              'Employer Inc.'),
  tx('t002', '2025-11-05', 650,  'Freelance',       'income',  'Logo design project',         'Freelance Client A'),
  tx('t003', '2025-11-03', 1200, 'Housing',         'expense', 'Monthly rent',                'Rent Payment'),
  tx('t004', '2025-11-04', 85,   'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t005', '2025-11-06', 12,   'Entertainment',   'expense', 'Monthly subscription',        'Spotify'),
  tx('t006', '2025-11-07', 15,   'Entertainment',   'expense', 'Streaming service',           'Netflix'),
  tx('t007', '2025-11-08', 42,   'Food & Dining',   'expense', 'Coffee & snacks',             'Starbucks'),
  tx('t008', '2025-11-10', 38,   'Transport',       'expense', 'Ride share',                  'Uber'),
  tx('t009', '2025-11-12', 95,   'Health',          'expense', 'Gym membership',              'Planet Fitness'),
  tx('t010', '2025-11-14', 220,  'Shopping',        'expense', 'Winter clothes',              'Zara'),
  tx('t011', '2025-11-15', 110,  'Food & Dining',   'expense', 'Weekly groceries',            'Trader Joe\'s'),
  tx('t012', '2025-11-17', 55,   'Transport',       'expense', 'Gas fill-up',                 'Shell Gas'),
  tx('t013', '2025-11-19', 35,   'Food & Dining',   'expense', 'Lunch out',                   'Chipotle'),
  tx('t014', '2025-11-20', 200,  'Investments',     'expense', 'Index fund contribution',     'Vanguard'),
  tx('t015', '2025-11-22', 75,   'Health',          'expense', 'Pharmacy',                    'CVS Pharmacy'),
  tx('t016', '2025-11-24', 90,   'Food & Dining',   'expense', 'Dinner with friends',         'McDonald\'s'),
  tx('t017', '2025-11-26', 120,  'Shopping',        'expense', 'Home supplies',               'Amazon'),
  tx('t018', '2025-11-28', 65,   'Entertainment',   'expense', 'Movie night',                 'AMC Theaters'),
  tx('t019', '2025-11-30', 88,   'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),

  // -- FEBRUARY 2025 - Slightly higher (~$3,100 expenses) --------------
  tx('t020', '2025-12-01', 4800, 'Salary',         'income',  'Monthly salary',              'Employer Inc.'),
  tx('t021', '2025-12-08', 450,  'Freelance',       'income',  'Web development work',        'Freelance Client B'),
  tx('t022', '2025-12-01', 1200, 'Housing',         'expense', 'Monthly rent',                'Rent Payment'),
  tx('t023', '2025-12-02', 95,   'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t024', '2025-12-03', 12,   'Entertainment',   'expense', 'Monthly subscription',        'Spotify'),
  tx('t025', '2025-12-04', 15,   'Entertainment',   'expense', 'Streaming service',           'Netflix'),
  tx('t026', '2025-12-06', 180,  'Shopping',        'expense', "Valentine's day gifts",       'Amazon'),
  tx('t027', '2025-12-07', 145,  'Food & Dining',   'expense', "Valentine's dinner",          'Starbucks'),
  tx('t028', '2025-12-10', 55,   'Transport',       'expense', 'Ride share',                  'Uber'),
  tx('t029', '2025-12-12', 95,   'Health',          'expense', 'Gym membership',              'Planet Fitness'),
  tx('t030', '2025-12-14', 200,  'Investments',     'expense', 'Index fund contribution',     'Vanguard'),
  tx('t031', '2025-12-16', 115,  'Food & Dining',   'expense', 'Weekly groceries',            'Trader Joe\'s'),
  tx('t032', '2025-12-18', 42,   'Transport',       'expense', 'Gas fill-up',                 'Shell Gas'),
  tx('t033', '2025-12-20', 85,   'Health',          'expense', 'Pharmacy',                    'Walgreens'),
  tx('t034', '2025-12-22', 320,  'Shopping',        'expense', 'New shoes',                   'Nike'),
  tx('t035', '2025-12-25', 78,   'Food & Dining',   'expense', 'Lunch & coffee',              'Chipotle'),
  tx('t036', '2025-12-27', 220,  'Housing',         'expense', 'Electricity & internet',      'Electric Company'),

  // -- MARCH 2025 - Overspend month (~$3,800 - vacation + medical) -----
  tx('t037', '2026-01-01', 4800, 'Salary',         'income',  'Monthly salary',              'Employer Inc.'),
  tx('t038', '2026-01-12', 800,  'Freelance',       'income',  'UI design contract',          'Freelance Client A'),
  tx('t039', '2026-01-01', 1200, 'Housing',         'expense', 'Monthly rent',                'Rent Payment'),
  tx('t040', '2026-01-03', 12,   'Entertainment',   'expense', 'Monthly subscription',        'Spotify'),
  tx('t041', '2026-01-03', 15,   'Entertainment',   'expense', 'Streaming service',           'Netflix'),
  tx('t042', '2026-01-05', 650,  'Transport',       'expense', 'Flight - spring vacation',    'Delta Airlines'),
  tx('t043', '2026-01-06', 780,  'Housing',         'expense', 'Airbnb - 4 nights',           'Airbnb'),
  tx('t044', '2026-01-10', 210,  'Food & Dining',   'expense', 'Vacation dining',             'McDonald\'s'),
  tx('t045', '2026-01-11', 95,   'Health',          'expense', 'Gym membership',              'Planet Fitness'),
  tx('t046', '2026-01-13', 320,  'Health',          'expense', 'Doctor visit + prescriptions','CVS Pharmacy'),
  tx('t047', '2026-01-15', 130,  'Food & Dining',   'expense', 'Weekly groceries',            'Whole Foods'),
  tx('t048', '2026-01-17', 200,  'Investments',     'expense', 'Index fund contribution',     'Vanguard'),
  tx('t049', '2026-01-19', 145,  'Shopping',        'expense', 'Vacation souvenirs',          'Amazon'),
  tx('t050', '2026-01-22', 55,   'Transport',       'expense', 'Ride share',                  'Uber'),
  tx('t051', '2026-01-26', 88,   'Food & Dining',   'expense', 'Grocery run',                 'Trader Joe\'s'),
  tx('t052', '2026-01-29', 42,   'Entertainment',   'expense', 'Gaming purchase',             'Steam'),

  // -- APRIL 2025 - Recovery + salary bonus (~$2,700 expenses) ---------
  tx('t053', '2026-02-01', 4800, 'Salary',         'income',  'Monthly salary',              'Employer Inc.'),
  tx('t054', '2026-02-01', 2000, 'Salary',         'income',  'Q1 performance bonus',        'Employer Inc.'),
  tx('t055', '2026-02-01', 1200, 'Housing',         'expense', 'Monthly rent',                'Rent Payment'),
  tx('t056', '2026-02-02', 12,   'Entertainment',   'expense', 'Monthly subscription',        'Spotify'),
  tx('t057', '2026-02-02', 15,   'Entertainment',   'expense', 'Streaming service',           'Netflix'),
  tx('t058', '2026-02-05', 95,   'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t059', '2026-02-07', 95,   'Health',          'expense', 'Gym membership',              'Planet Fitness'),
  tx('t060', '2026-02-10', 400,  'Investments',     'expense', 'Extra investment - bonus',    'Fidelity'),
  tx('t061', '2026-02-12', 48,   'Transport',       'expense', 'Ride share',                  'Lyft'),
  tx('t062', '2026-02-14', 115,  'Food & Dining',   'expense', 'Weekly groceries',            'Trader Joe\'s'),
  tx('t063', '2026-02-17', 280,  'Shopping',        'expense', 'Electronics',                 'Best Buy'),
  tx('t064', '2026-02-20', 65,   'Food & Dining',   'expense', 'Brunch',                      'Starbucks'),
  tx('t065', '2026-02-23', 75,   'Health',          'expense', 'Pharmacy',                    'Walgreens'),
  tx('t066', '2026-02-25', 200,  'Investments',     'expense', 'Index fund contribution',     'Vanguard'),
  tx('t067', '2026-02-28', 100,  'Entertainment',   'expense', 'Concert tickets',             'AMC Theaters'),

  // -- MAY 2025 - Steady recovery (~$3,000 expenses) -------------------
  tx('t068', '2026-03-01', 4800, 'Salary',         'income',  'Monthly salary',              'Employer Inc.'),
  tx('t069', '2026-03-09', 550,  'Freelance',       'income',  'Consulting project',          'Freelance Client B'),
  tx('t070', '2026-03-01', 1200, 'Housing',         'expense', 'Monthly rent',                'Rent Payment'),
  tx('t071', '2026-03-02', 12,   'Entertainment',   'expense', 'Monthly subscription',        'Spotify'),
  tx('t072', '2026-03-02', 15,   'Entertainment',   'expense', 'Streaming service',           'Netflix'),
  tx('t073', '2026-03-04', 105,  'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t074', '2026-03-06', 45,   'Transport',       'expense', 'Ride share',                  'Uber'),
  tx('t075', '2026-03-08', 95,   'Health',          'expense', 'Gym membership',              'Planet Fitness'),
  tx('t076', '2026-03-11', 200,  'Investments',     'expense', 'Index fund contribution',     'Vanguard'),
  tx('t077', '2026-03-13', 125,  'Food & Dining',   'expense', 'Weekly groceries',            'Trader Joe\'s'),
  tx('t078', '2026-03-15', 88,   'Shopping',        'expense', 'Clothing',                    'Zara'),
  tx('t079', '2026-03-18', 55,   'Transport',       'expense', 'Gas fill-up',                 'Shell Gas'),
  tx('t080', '2026-03-20', 165,  'Health',          'expense', 'Health insurance',            'Blue Cross Insurance'),
  tx('t081', '2026-03-22', 72,   'Food & Dining',   'expense', 'Dinner out',                  'Chipotle'),
  tx('t082', '2026-03-24', 240,  'Shopping',        'expense', 'Home decor',                  'Target'),
  tx('t083', '2026-03-26', 110,  'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t084', '2026-03-28', 35,   'Entertainment',   'expense', 'Movie night',                 'AMC Theaters'),
  tx('t085', '2026-03-30', 48,   'Food & Dining',   'expense', 'Coffee & snacks',             'Starbucks'),

  // -- JUNE 2025 - Best savings month (~$3,200 expenses, highest net) --
  tx('t086', '2026-04-01', 4800, 'Salary',         'income',  'Monthly salary',              'Employer Inc.'),
  tx('t087', '2026-04-06', 900,  'Freelance',       'income',  'Full website build',          'Freelance Client A'),
  tx('t088', '2026-04-01', 1200, 'Housing',         'expense', 'Monthly rent',                'Rent Payment'),
  tx('t089', '2026-04-02', 12,   'Entertainment',   'expense', 'Monthly subscription',        'Spotify'),
  tx('t090', '2026-04-02', 15,   'Entertainment',   'expense', 'Streaming service',           'Netflix'),
  tx('t091', '2026-04-04', 98,   'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t092', '2026-04-06', 42,   'Transport',       'expense', 'Ride share',                  'Uber'),
  tx('t093', '2026-04-08', 95,   'Health',          'expense', 'Gym membership',              'Planet Fitness'),
  tx('t094', '2026-04-10', 350,  'Investments',     'expense', 'Index fund contribution',     'Vanguard'),
  tx('t095', '2026-04-12', 118,  'Food & Dining',   'expense', 'Weekly groceries',            'Trader Joe\'s'),
  tx('t096', '2026-04-14', 52,   'Transport',       'expense', 'Gas fill-up',                 'Shell Gas'),
  tx('t097', '2026-04-16', 165,  'Health',          'expense', 'Health insurance',            'Blue Cross Insurance'),
  tx('t098', '2026-04-18', 135,  'Shopping',        'expense', 'Summer clothes',              'Target'),
  tx('t099', '2026-04-20', 68,   'Food & Dining',   'expense', 'Lunch out',                   'Chipotle'),
  tx('t100', '2026-04-22', 22,   'Entertainment',   'expense', 'Gaming purchase',             'Steam'),
  tx('t101', '2026-04-24', 82,   'Food & Dining',   'expense', 'Grocery run',                 'Whole Foods'),
  tx('t102', '2026-04-26', 38,   'Food & Dining',   'expense', 'Coffee & snacks',             'Starbucks'),
  tx('t103', '2026-04-28', 200,  'Investments',     'expense', 'Fidelity contribution',       'Fidelity'),
];

export default mockTransactions;

