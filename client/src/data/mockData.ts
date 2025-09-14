// This file contains mock data constants that could be used for development/testing purposes
// Note: The application uses real data from the backend storage, not mock data

export const MOCK_CATEGORIES = [
  { id: "1", name: "Premium Cakes", slug: "premium-cakes", itemCount: 24 },
  { id: "2", name: "Traditional Sweets", slug: "traditional-sweets", itemCount: 18 },
  { id: "3", name: "Custom Cakes", slug: "custom-cakes", itemCount: 0 },
  { id: "4", name: "Cupcakes", slug: "cupcakes", itemCount: 15 },
  { id: "5", name: "Savories", slug: "savories", itemCount: 12 },
  { id: "6", name: "Cookies & Desserts", slug: "cookies-desserts", itemCount: 20 },
  { id: "7", name: "Wedding Cakes", slug: "wedding-cakes", itemCount: 8 },
  { id: "8", name: "Gift Hampers", slug: "gift-hampers", itemCount: 6 }
];

export const MOCK_TESTIMONIALS = [
  {
    id: "1",
    name: "Haseena Ibrahim",
    rating: 5,
    text: "I ordered cakes and savories from Velvet Crumbs for my daughter's birthday, and everything was perfect. The team was attentive, and the treats were beautifully decorated and delicious.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b742?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
  },
  {
    id: "2", 
    name: "Shama Wahid",
    rating: 5,
    text: "Velvet Crumbs made my anniversary celebration truly unforgettable. The cake was a work of art, both visually and taste-wise. The team was incredibly attentive.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
  }
];

export const MOCK_FAQ = [
  {
    question: "How far in advance should I place my order?",
    answer: "We require 24-48 hours notice for most items. Custom cakes and large orders may need more time."
  },
  {
    question: "Do you offer delivery?",
    answer: "Yes! We deliver island-wide across Sri Lanka. Delivery fees vary by location."
  },
  {
    question: "Can you accommodate dietary restrictions?", 
    answer: "Absolutely! We can create sugar-free, gluten-free, vegan, and other specialized options."
  }
];

export const CONTACT_INFO = {
  phone: "+94 76 059 9559",
  email: "info@velvetcrumbs.lk", 
  address: "Colombo, Sri Lanka",
  hours: {
    weekday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 4:00 PM", 
    sunday: "Closed"
  }
};

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/velvetcrumbs",
  instagram: "https://instagram.com/velvetcrumbs"
};
