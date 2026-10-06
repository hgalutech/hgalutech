type HeroSlide = {
  imageSrc: string;
  imageAlt: string;
  imagePublicId?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  video?: {
    src: string;
    publicId?: string;
    posterSrc?: string;
    posterPublicId?: string;
    label?: string;
  } | null;
};

type HomeStat = {
  target: number;
  suffix: string;
  label: string;
};

type HomeProduct = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  wide?: boolean;
};

type HomeTestimonial = {
  initials: string;
  name: string;
  role: string;
  quote: string;
};

type HomeFaq = {
  question: string;
  answer: string;
};

export type HomeContent = {
  hero: {
    slides: HeroSlide[];
  };
  capability: {
    eyebrow: string;
    title: string;
    body: string;
    highlightWords: string[];
    stats: HomeStat[];
  };
  products: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomeProduct[];
  };
  mission: {
    imageSrc: string;
    imageAlt: string;
    statement: string;
  };
  ctaBanner: {
    title: string;
    ctaLabel: string;
    ctaHref: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    items: HomeTestimonial[];
  };
  customers: {
    eyebrow: string;
    title: string;
    description: string;
    logos: string[];
  };
  jointVentures: {
    eyebrow: string;
    title: string;
    imageSrc: string;
    imageAlt: string;
    items: { title: string; subtitle: string; icon: "handshake" | "factory" | "leaf" }[];
  };
  careers: {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    images: { src: string; alt: string }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: HomeFaq[];
  };
};

/** HG Alutech home copy for the Kadi / Mahesana campus. */
export const homeContentEn: HomeContent = {
  hero: {
    slides: [
      {
        imageSrc: "/products/aluminium-ingots.jpg",
        imageAlt: "Aluminium ingots packed for dispatch",
        eyebrow: "HG Alutech · Kadi, Gujarat",
        title: "Aluminium you can specify and schedule",
        subtitle:
          "Aluminium ingots, plus cubes, shots, notch bars and deoxidizer products — chemistry, certificates, and a Kadi / Mahesana plant you can enquire against.",
        primaryCta: { label: "Inquire Now", href: "contact" },
        video: {
          src: "/media/alumina-process.webm",
          posterSrc: "/products/aluminium-ingots.jpg",
          label: "Aluminium process film",
        },
      },
      {
        imageSrc: "/products/aluminium-shots.jpg",
        imageAlt: "Aluminium shots for melt addition",
        eyebrow: "Ingots · Steel deoxidation",
        title: "Ingots for foundry and remelt",
        subtitle:
          "Secondary aluminium and alloy ingots for foundries, die-casters, alloy makers and remelt programmes.",
        primaryCta: { label: "Inquire Now", href: "contact" },
        video: null,
      },
      {
        imageSrc: "/products/aluminium-cubes.jpg",
        imageAlt: "Aluminium cubes for melt addition",
        eyebrow: "Steel deoxidation",
        title: "Cubes, shots, notch bars and deoxidizer",
        subtitle:
          "Current catalogue forms for steel plants and metallurgical treatment — sized, packed and certified to the purchase order.",
        primaryCta: { label: "View catalogue", href: "products" },
        video: null,
      },
    ],
  },
  capability: {
    eyebrow: "HG Alutech",
    title: "Ingots and deoxidation forms.",
    body: "HG Alutech supplies aluminium ingots, cubes, shots, notch bars and deoxidizer products from the Kadi / Mahesana campus.",
    highlightWords: ["ingots", "cubes", "shots", "deoxidizer"],
    stats: [
      { target: 5, suffix: "", label: "Current catalogue lines" },
      { target: 8, suffix: "+", label: "Industry segments" },
      { target: 1, suffix: "", label: "Integrated Gujarat campus" },
      { target: 100, suffix: "%", label: "Lots with release docs" },
    ],
  },
  products: {
    eyebrow: "Our Products",
    title: "Current aluminium catalogue",
    description:
      "Aluminium ingots, cubes, shots, notch bars and deoxidizer products — all current, all in the aluminium category.",
    items: [],
  },
  mission: {
    imageSrc: "/products/aluminium-ingots.jpg",
    imageAlt: "Aluminium ingots packed for dispatch",
    statement:
      "To be the aluminium partner programmes trust — for chemistry, certificates and on-time delivery.",
  },
  ctaBanner: {
    title: "Have a die, alloy or tonnage in mind? Tell us your programme.",
    ctaLabel: "Inquire Now",
    ctaHref: "contact",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "What our partners say",
    items: [],
  },
  customers: {
    eyebrow: "Our Customers",
    title: "Confirmed existing customers",
    description:
      "Confirmed customers only. Potential accounts are listed separately on the Customers page.",
    logos: [
      "Cosmos Construction",
      "Technocraft Industries",
      "Waaree Energies",
      "I-Form Aluminium",
      "Eins Technik",
      "Grasim Industries",
      "Knest Manufacturers",
      "SB Scaffolding",
      "Aditya Metal",
      "Alrod Industries",
      "Palco Recycle",
      "Sakar Industries",
      "Wincab Industries",
    ],
  },
  jointVentures: {
    eyebrow: "Plant capability",
    title: "Ingots and steel-plant forms",
    imageSrc: "/products/aluminium-shots.jpg",
    imageAlt: "Aluminium shots for melt addition",
    items: [
      {
        title: "Casting & remelt",
        subtitle: "Ingots and alloy grades to the order",
        icon: "factory",
      },
      {
        title: "Lot certificates",
        subtitle: "Chemistry and form on the purchase order",
        icon: "handshake",
      },
      {
        title: "Steel deoxidation",
        subtitle: "Cubes, shots, notch bars, deoxidizer",
        icon: "leaf",
      },
    ],
  },
  careers: {
    eyebrow: "Careers & life at HG",
    title: "Built by people who care about the craft",
    body: "Our people keep the melt, press and quality loops honest. We invest in a safe plant culture, competitive compensation, and real room to grow.",
    ctaLabel: "View openings",
    ctaHref: "careers",
    images: [
      {
        src: "/products/aluminium-ingots.jpg",
        alt: "Aluminium ingots",
      },
      {
        src: "/products/aluminium-cubes.jpg",
        alt: "Aluminium cubes",
      },
      {
        src: "/products/aluminium-deoxidizer.jpg",
        alt: "Aluminium deoxidizer cubes",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        question: "What does HG Alutech supply?",
        answer:
          "Five current aluminium lines: ingots, cubes, shots, notch bars and deoxidizer products, from the Kadi / Mahesana campus in Gujarat.",
      },
      {
        question: "Where is the plant located?",
        answer:
          "Our manufacturing campus is at Laxmipura Nandasan, Taluka Kadi (Mahesana district), Gujarat — melting, casting and extrusion under one roof.",
      },
      {
        question: "How do I enquire about a grade or die?",
        answer:
          "Use Inquire Now / Contact with alloy, section, tonnage and delivery window. Procurement and technical teams respond with feasibility and lead-time guidance.",
      },
      {
        question: "Do you supply mill certificates?",
        answer:
          "Yes. Documented release criteria and certificates travel with every consignment so your quality and audit teams can verify chemistry and dimensions.",
      },
      {
        question: "Which markets do you serve?",
        answer:
          "Architectural and infrastructure extrusions, solar mounting and frames, industrial sections, cable / conductor-related demand, and foundry remelt programmes — see Markets we serve for the full map.",
      },
      {
        question: "Are cubes, shots and notch bars available to order?",
        answer:
          "Yes. Cubes, shots, notch bars and deoxidizer products are current catalogue lines, in the same aluminium category as profiles, billets and ingots. Send alloy, form, sizing and tonnage with your enquiry.",
      },
    ],
  },
};
