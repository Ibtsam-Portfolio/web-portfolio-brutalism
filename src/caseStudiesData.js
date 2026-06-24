export const caseStudies = [
  {
    id: "quiet-dashboard",
    title: "The Quiet Dashboard",
    role: "Product Design & Frontend",
    client: "FinTech Startup",
    year: "2024",
    problem: "A command center nobody trusted; visibility felt chaotic. Users couldn't quickly scan alerts and ownership was unclear, leading to missed critical updates.",
    solution: [
      "Implemented a three-tier alert hierarchy: critical (red), warning (yellow), and info (gray) with clear visual distinctions.",
      "Added owner assignment to each alert with a minimal avatar and name for quick context.",
      "Created a calm, dark-mode interface with reduced motion and subtle hover states to reduce cognitive load."
    ],
    features: [
      {
        name: "Real-time monitoring",
        description: "Live data feeds with WebSocket updates and push notifications for critical alerts."
      },
      {
        name: "Smart filtering",
        description: "Customizable filters by severity, owner, and time range to surface relevant information."
      },
      {
        name: "Export & reporting",
        description: "Generate PDF reports and CSV exports for compliance and audit trails."
      }
    ],
    techStack: ["React", "Node.js", "PostgreSQL", "Redis", "Socket.io", "Tailwind CSS"],
    results: [
      { value: "65%", label: "Alerts resolved faster" },
      { value: "78%", label: "User satisfaction" },
      { value: "40%", label: "Reduced alert noise" }
    ],
    visuals: {
      hero: "/assets/quiet-dashboard-hero.png",
      gallery: [
        "/assets/quiet-dashboard-1.png",
        "/assets/quiet-dashboard-2.png",
        "/assets/quiet-dashboard-3.png"
      ]
    },
    quote: "The new dashboard completely changed how our team operates. We went from chaos to clarity in two weeks.",
    quoteAuthor: "Sarah Chen",
    quoteRole: "CTO, FinTech Startup"
  },
  {
    id: "first-impression",
    title: "First Impression",
    role: "Full-Stack Development",
    client: "E-commerce Brand",
    year: "2024",
    problem: "An unfocused portfolio that confused visitors and lost leads. Slow load times and unclear value proposition resulted in a 35% drop in conversions.",
    solution: [
      "Restructured the site hierarchy to lead with outcomes, not features.",
      "Optimized images and implemented lazy loading to reduce load time by 60%.",
      "Added clear CTAs and social proof (client logos, testimonials) to build trust."
    ],
    features: [
      {
        name: "Performance-first architecture",
        description: "Core Web Vitals optimized with a Next.js app router and edge caching."
      },
      {
        name: "Conversion-focused layout",
        description: "Strategic placement of CTAs and social proof elements based on user behavior."
      },
      {
        name: "Mobile-first responsive design",
        description: "Fully responsive design that works seamlessly across all devices."
      }
    ],
    techStack: ["Next.js", "React", "Tailwind CSS", "Framer Motion", "Vercel"],
    results: [
      { value: "42%", label: "Conversion increase" },
      { value: "60%", label: "Load time reduction" },
      { value: "28%", label: "Bounce rate decrease" }
    ],
    visuals: {
      hero: "/assets/first-impression-hero.png",
      gallery: [
        "/assets/first-impression-1.png",
        "/assets/first-impression-2.png"
      ]
    },
    quote: "The new site converted 40% more leads and loads in under 1 second on mobile. Game changer.",
    quoteAuthor: "Marcus Johnson",
    quoteRole: "Founder, E-commerce Brand"
  },
  {
    id: "honest-machine",
    title: "The Honest Machine",
    role: "AI Product Design",
    client: "AI Startup",
    year: "2024",
    problem: "AI features that felt magical but untrustworthy. Users didn't understand how recommendations were generated and couldn't audit the reasoning.",
    solution: [
      "Built a transparent reasoning step-by-step view showing how the AI arrived at its decision.",
      "Added provenance badges and data source attribution for all AI-generated content.",
      "Implemented clear controls for users to adjust AI behavior and override recommendations."
    ],
    features: [
      {
        name: "Explainable AI",
        description: "Step-by-step reasoning display with visual flowcharts and plain-language explanations."
      },
      {
        name: "Provenance tracking",
        description: "Track and display the data sources and models used for each AI-generated output."
      },
      {
        name: "User control",
        description: "Allow users to adjust AI confidence thresholds and override recommendations."
      }
    ],
    techStack: ["React", "Python", "OpenAI API", "LangChain", "PostgreSQL", "Docker"],
    results: [
      { value: "72%", label: "Trust score increase" },
      { value: "45%", label: "Support ticket reduction" },
      { value: "38%", label: "Feature adoption" }
    ],
    visuals: {
      hero: "/assets/honest-machine-hero.png",
      gallery: [
        "/assets/honest-machine-1.png",
        "/assets/honest-machine-2.png",
        "/assets/honest-machine-3.png"
      ]
    },
    quote: "The transparency features made users feel safe using our AI. We went from 'too magic' to 'actually helpful'.",
    quoteAuthor: "Dr. Amanda Lee",
    quoteRole: "Head of Product, AI Startup"
  },
  {
    id: "common-ground",
    title: "Common Ground",
    role: "CMS & Editorial Design",
    client: "Media Company",
    year: "2023",
    problem: "Editors struggled with updating content and layouts. The legacy CMS was complex, required developer help for simple changes, and led to delayed publishing.",
    solution: [
      "Built a modular content model with reusable components and flexible layouts.",
      "Created an intuitive editor interface with drag-and-drop sections and live preview.",
      "Implemented version history and rollback for safe experimentation."
    ],
    features: [
      {
        name: "Modular content blocks",
        description: "Reusable components (hero, cards, galleries) with flexible nesting and configuration."
      },
      {
        name: "Visual editor",
        description: "WYSIWYG editor with drag-and-drop sections and real-time preview."
      },
      {
        name: "Version control",
        description: "Automated version history with one-click rollback and diff view."
      }
    ],
    techStack: ["Next.js", "Sanity CMS", "Tailwind CSS", "Framer Motion", "Vercel"],
    results: [
      { value: "50%", label: "Editorial time saved" },
      { value: "35%", label: "Publish cadence increase" },
      { value: "70%", label: "Developer request reduction" }
    ],
    visuals: {
      hero: "/assets/common-ground-hero.png",
      gallery: [
        "/assets/common-ground-1.png",
        "/assets/common-ground-2.png"
      ]
    },
    quote: "Our editors can now publish articles in half the time. The modular approach has transformed our workflow.",
    quoteAuthor: "James Wilson",
    quoteRole: "Editor-in-Chief, Media Company"
  }
];