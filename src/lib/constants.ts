export const OCCASIONS = {
  "🎉 Social / Personal": [
    "Wedding", "Engagement", "Reception", "Sangeet Ceremony", "Haldi Ceremony",
    "Pre-wedding Mehendi Party", "Anniversary Party", "Birthday Party",
    "Kids Birthday Party", "First Birthday Party", "Baby Shower", "Bridal Shower",
    "Bachelor Party", "Kitty Party", "Get Together", "Class Reunion",
    "Family Function", "Naming Ceremony", "Aqueeqa Ceremony", "Christian Communion",
    "Ring Ceremony", "Childrens Party", "Reunion Party"
  ],
  "🪩 Parties & Celebrations": [
    "Cocktail Party", "Cocktail Dinner", "Pool Party", "Garba Night", "Holi Party",
    "Freshers Party", "Adventure Party", "Group Dining", "Party"
  ],
  "🏢 Corporate / Professional": [
    "Corporate Event", "Corporate Party", "Corporate Training", "Corporate Offsite",
    "Conference", "Seminar", "Meeting", "Training", "Team Outing", "Product Launch",
    "Brand Promotion", "Exhibition", "Walkin Interview", "Business Dinner",
    "Residential Conference", "MICE", "Award Ceremony"
  ],
  "🎭 Entertainment / Cultural": [
    "Musical Concert", "Fashion Show", "Stage Event", "Game Watch", "Annual Fest", "Photo Shoots"
  ]
};

export const VENUE_TYPES = [
  'Banquet Halls', 'Farmhouses', 'Party Plots', 'Hotels', 'Resorts', 'Restaurants',
  'Convention Centers', 'Clubs', 'Rooftop Venues', 'Garden Venues', 'Heritage Venues', 'Luxury Venues', 'Cafes'
];

export const VENDOR_TYPES = [
  'Photographers', 'Wedding Photographers', 'Videographers', 'Caterers', 'Decorators',
  'Mehndi Artists', 'DJs', 'Bands', 'Event Planners', 'Wedding Planners', 'Makeup Artists',
  'Florists', 'Tent Houses', 'Choreographers', 'Invitation Cards', 'Cake Shops',
  'Jewellers', 'Astrologers', 'Magicians', 'Entertainers', 'Bridal Wear', 'Groom Wear'
];

export const GUJARAT_CITIES = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar',
  'Anand', 'Junagadh', 'Gandhidham', 'Navsari', 'Morbi', 'Bhuj', 'Valsad', 'Palanpur', 'Dahod'
];

export const EVENT_SUGGESTIONS = Object.values(OCCASIONS).flat();

export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceLabel: 'Free',
    duration: '/ month',
    leads: 50,
    features: [
      'Basic listing profile',
      'Standard search placement',
      'Enquiry notifications',
      'Email support'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 999,
    priceLabel: '₹999',
    duration: '/ month',
    leads: 150,
    popular: true,
    features: [
      'Featured listing + badge',
      'Priority search ranking',
      'WhatsApp lead alerts',
      'Analytics dashboard',
      'Social media promo'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1999,
    priceLabel: '₹1,999',
    duration: '/ month',
    leads: 'Unlimited',
    bestValue: true,
    features: [
      'Top placement always',
      'Homepage featured slot',
      'Dedicated account manager',
      'Brand ambassador ready',
      'Bulk WhatsApp campaigns'
    ]
  }
];

