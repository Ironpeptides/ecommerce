export const siteConfig = {
  name: "Vilyo Inventory",
  shortName: "Vi",
  description:
    "Providing exceptional software services with compassion and expertise since 2008. Our commitment to excellence has made us a trusted software provider in the region.",

  // Contact Information
  contact: {
    phone: {
      primary: "+254(0) 746358820",
      emergency: "+254(0) 115547750",
      whatsapp: "+254(0) 746358820",
    },
    email: {
      primary: "simiyunevily@gmail.com",
      support: "info@vilyoInventory.com",
      appointments: "simiyunevily@gmail.com",
    },
    address: {
      street: "P.O.Box 384",
      city: "Nairobi",
      country: "Kenya",
      coordinates: {
        latitude: "0.11111",
        longitude: "30.11111",
      },
    },
  },

  // Social Media Links
  social: {
    facebook: "https://facebook.com/kasesehospital",
    twitter: "https://twitter.com/kasesehospital",
    instagram: "https://instagram.com/kasesehospital",
    linkedin: "https://linkedin.com/company/kasesehospital",
    youtube: "https://youtube.com/kasesehospital",
  },

  // Working Hours
  workingHours: {
    status: "24/7 All Week Days",
    emergency: "24/7 Emergency Services",
    outpatient: "Monday - Saturday: 8:00 AM - 5:00 PM",
    software: "24/7 Software Services",
    Consultation: "24/7 Consultation Services",
  },

  // Company Meta Information
  meta: {
    foundedYear: 2025,
    license: "Kenya Copyright Board",
    accreditation: "Internationally Accredited Software Company",
    values: [
      {
        title: "Excellence",
        description: "Committed to providing the highest quality software",
      },
      {
        title: "Compassion",
        description: "Treating every business with care and empathy",
      },
      {
        title: "Innovation",
        description: "Embracing modern software technologies and practices",
      },
    ],
  },

  // Service Categories
  services: {
    emergency: [
      "24/7 Emergency Care",
      "Consultation Services",
      "Software development services",
      "Critical troubleshooting",
    ],
    specialties: [
      "Website development",
      "Mobile app development",
      "Cybersecurity services",
      "Artificial Intelligence",
      "e.Commerce",
      "Point of Sale",
      "Finance Department",
    ],
    supportServices: [
      "Website",
      "Inventory",
      "Point of sale(POS)",
      "Finance",
      "Consultation",
    ],
  },


  

  // Search Engine Optimization (SEO) Configuration
  seo: {
    title: "Enterprise Suite Platform - Finance, POS, and Project Management Solutions",
    description:
      "Integrated enterprise suite offering real-time financial tracking, automated POS inventory updates via Mobile Money (M-Pesa), and project management for East African businesses.",
    keywords: [
      "enterprise suite",
      "finance platform",
      "POS system",
      "inventory management",
      "project management system",
      "M-Pesa integration",
      "business software",
      "East Africa",
      "SME solutions",
    ],
    ogImage: "https://yorenterpriseplatform.com/assets/og-image-suite.jpg",
  },

  // Legal Information and Compliance
  legal: {
    name: "Enterprise Solutions Tech Ltd",
    registration: "KE2025ABCDE", // Placeholder registration number
    privacyPolicy: "/legal/privacy-policy",
    terms: "/legal/terms-of-service",
    dataSecurity: "/legal/data-security-policy",
  },

  // Core Service Modules/Features
  serviceModules: [
    {
      id: "finance",
      name: "Financial Management",
      description: "Automated transaction logging, ledger, and reporting.",
    },
    {
      id: "pos",
      name: "POS & Inventory",
      description: "Point-of-Sale with real-time stock management and mobile money linking.",
    },
    {
      id: "pm",
      name: "Project Management",
      description: "Task tracking, resource allocation, and budget control.",
    },
  ],

  // Billing and Subscription Configuration
  billing: {
    tiers: [
      {
        id: "starter",
        name: "Starter (SME)",
        price: 500, // Monthly price in KES (your suggested price)
        features: ["Finance Module", "Basic POS", "M-Pesa Notifications"],
      },
      {
        id: "pro",
        name: "Professional (Growth)",
        price: 1500, // Higher tier price
        features: ["All Starter Features", "Full Inventory", "Project Management Lite", "Multi-User Access"],
      },
    ],
    paymentMethods: [
      "Mobile Money (M-Pesa, Airtel Money)",
      "Bank Transfer",
      "Credit/Debit Card (Visa/Mastercard)",
    ],
  },
}


// Helper function to get formatted contact info
export const getContactInfo = () => {
  const { contact } = siteConfig;
  return {
    mainPhone: contact.phone.primary,
    emergency: contact.phone.emergency,
    email: contact.email.primary,
    fullAddress: `${contact.address.street}, ${contact.address.city}, ${contact.address.country}`,
  };
};

// Helper function to get social media links
export const getSocialLinks = () => {
  return siteConfig.social;
};

// Helper function to get working hours
export const getWorkingHours = () => {
  return siteConfig.workingHours;
};

// Helper function to get SEO metadata
export const getSEOData = (pageName?: string) => {
  return {
    title: pageName ? `${pageName} - ${siteConfig.name}` : siteConfig.seo.title,
    description: siteConfig.seo.description,
    keywords: siteConfig.seo.keywords.join(", "),
    ogImage: siteConfig.seo.ogImage,
  };
};
