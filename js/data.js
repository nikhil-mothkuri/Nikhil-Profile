/* ===================================================================
   DATA ARCHITECTURE & PORTFOLIO DATA STORE
   Nikhil Mothkuri's Professional Profile & Career Journey
   =================================================================== */

const PORTFOLIO_DATA = {
  profile: {
    name: "Nikhil",
    fullName: "Nikhil Mothkuri",
    title: "Lead Software Architect & AI Systems Specialist | JPMorgan Chase & Co.",
    availability: "Available for Strategic Advisory & Leadership Collaboration",
    location: "Hyderabad, Telangana, India (Global Experience)",
    email: "nikhilvce@gmail.com",
    github: "https://github.com/nikhil-mothkuri",
    linkedin: "https://www.linkedin.com/in/nikhil-mothkuri-a3887747/",
    twitter: "https://x.com",
    elevatorPitch: "Lead Software Architect at JPMorgan Chase & Co. with international engineering tenure across Dell Technologies (Ireland), Oracle, and Infosys. Specialized in enterprise distributed architectures, cloud-native scalability, and production AI/ML systems.",
    stats: [
      { number: "12+", label: "Years Enterprise Engineering" },
      { number: "5+", label: "Global Leaders (JPMorgan, Dell, Oracle, Infosys)" },
      { number: "10M+", label: "Daily Transaction Scale" },
      { number: "99.99%", label: "Production Financial SLA" }
    ]
  },

  skills: [
    // Full-Stack & Distributed Systems
    { id: "ts-react", name: "TypeScript & React / Next.js", category: "systems", level: 96, proof: "Architected enterprise financial dashboards and modern micro-frontends with high-performance hydration." },
    { id: "java-microservices", name: "Java, Spring Boot & Distributed Services", category: "systems", level: 95, proof: "Engineered ultra-reliable distributed services handling millions of high-concurrency requests daily." },
    { id: "dist-db", name: "Oracle, PostgreSQL, Redis & Event Streaming", category: "systems", level: 94, proof: "Optimized multi-terabyte transactional and analytics data pipelines with sub-second query latency." },
    { id: "cloud-k8s", name: "Kubernetes, Docker & Multi-Region Cloud", category: "systems", level: 92, proof: "Automated container orchestration and GitOps CI/CD pipelines across enterprise cloud infrastructures." },

    // AI/ML & Intelligent Systems
    { id: "mlops-pipeline", name: "MLOps & Production ML Pipelines", category: "ai", level: 93, proof: "Built and automated end-to-end MLOps regression and classification pipelines through UpGrad specializations." },
    { id: "llm-agents", name: "Autonomous LLM Agents & Workflow Orchestration", category: "ai", level: 92, proof: "Designed tool-calling agent reasoning architectures and context routing for enterprise knowledge retrieval." },
    { id: "neural-nets", name: "Neural Networks & Deep Learning (CNNs)", category: "ai", level: 90, proof: "Implemented deep learning architectures, feature extraction, and convolutional models for predictive analytics." },
    { id: "eval-guard", name: "Model Guardrails & Enterprise Quality Assurance", category: "ai", level: 91, proof: "Architected defensive evaluation harnesses to prevent hallucinations and ensure enterprise compliance." },

    // Leadership & Architecture
    { id: "tech-lead", name: "Technical Leadership & Cross-Functional Strategy", category: "leadership", level: 96, proof: "Guided global engineering teams across Ireland and India through major modernization initiatives." },
    { id: "sys-arch", name: "Enterprise Architecture & RFC Governance", category: "leadership", level: 95, proof: "Established architectural review boards, microservice guidelines, and resilient banking design patterns." },
    { id: "prod-eng", name: "Stakeholder Alignment & Product Delivery", category: "leadership", level: 93, proof: "Partnered closely with executive leadership and product directors to convert strategic roadmaps into production reality." }
  ],

  metroStations: [
    {
      id: "station-1",
      name: "Software Engineer",
      company: "Infosys",
      period: "Early Career",
      track: "systems",
      trackLabel: "Systems Foundations Line",
      color: "var(--line-systems)",
      isHub: false,
      svgPos: { x: 80, y: 320 },
      mandate: "Engineered foundational backend services, enterprise Java applications, and high-reliability client solutions.",
      metrics: [
        { val: "Enterprise", lbl: "Scale Delivery" },
        { val: "Java / Web", lbl: "Stack Mastery" }
      ],
      highlights: [
        "Built and maintained robust enterprise backend applications using Java, Spring, and SQL database layers.",
        "Instituted comprehensive automated unit testing and integration testing suites, accelerating sprint delivery.",
        "Collaborated across cross-functional engineering pods to deliver critical enterprise client features on schedule."
      ],
      tags: ["Java", "Spring", "SQL", "REST APIs", "Enterprise Systems", "Agile"]
    },
    {
      id: "station-2",
      name: "Systems & Database Engineer",
      company: "Oracle",
      period: "Mid Career",
      track: "systems",
      trackLabel: "Enterprise Systems Line",
      color: "var(--line-systems)",
      isHub: false,
      svgPos: { x: 250, y: 220 },
      mandate: "Architected high-throughput database integrations, enterprise middleware, and high-concurrency systems.",
      metrics: [
        { val: "Sub-50ms", lbl: "Query Latency Target" },
        { val: "High OLTP", lbl: "Throughput Optimization" }
      ],
      highlights: [
        "Engineered mission-critical enterprise database connectors, caching layers, and distributed middleware.",
        "Optimized high-concurrency SQL and PL/SQL workloads, resolving critical database lock contentions under peak traffic.",
        "Pioneered performance tuning standards and schema optimization protocols across product teams."
      ],
      tags: ["Oracle DB", "PL/SQL", "Distributed Caching", "Java", "Enterprise Cloud", "Performance Tuning"]
    },
    {
      id: "station-3",
      name: "Senior Full-Stack Architect & Consultant",
      company: "e-Data Experts",
      period: "Growth & Modernization",
      track: "systems",
      trackLabel: "Interchange Hub (Systems ✕ Architecture)",
      color: "var(--line-hub)",
      isHub: true,
      svgPos: { x: 440, y: 150 },
      mandate: "Led full-stack application modernization, cloud migration roadmaps, and distributed microservices architecture in Hyderabad.",
      metrics: [
        { val: "3.5x", lbl: "Throughput Multiplier" },
        { val: "100%", lbl: "Cloud Modernization" }
      ],
      highlights: [
        "Designed and executed comprehensive cloud migration from monolithic architectures to containerized microservices.",
        "Led full-stack engineering across frontend SPA architectures (TypeScript, React/Angular) and resilient backend event buses.",
        "Consulted enterprise stakeholders on technology modernization roadmaps, tech debt management, and API scalability."
      ],
      tags: ["Full-Stack", "TypeScript", "Docker", "Microservices", "Event-Driven", "Cloud Migration", "Hyderabad"]
    },
    {
      id: "station-4",
      name: "Senior Systems & Cloud Infrastructure Engineer",
      company: "Dell Technologies (Ireland)",
      period: "International Scale",
      track: "leadership",
      trackLabel: "Global Cloud Infrastructure Line",
      color: "var(--line-leadership)",
      isHub: false,
      svgPos: { x: 620, y: 220 },
      mandate: "Architected enterprise cloud telemetry, global infrastructure automation, and international high-availability platforms in Ireland.",
      metrics: [
        { val: "Global", lbl: "Multi-Region Cloud Scale" },
        { val: "99.99%", lbl: "Reliability Standard" }
      ],
      highlights: [
        "Spearheaded multi-region cloud infrastructure and telemetry pipelines serving global enterprise operations from Ireland.",
        "Automated infrastructure-as-code and container orchestration across high-density Kubernetes clusters.",
        "Led international cross-functional collaboration between European engineering hubs and global product organizations."
      ],
      tags: ["Dell Cloud", "Ireland", "Kubernetes", "Multi-Region", "Terraform", "CI/CD", "Global Operations"]
    },
    {
      id: "station-5",
      name: "Lead Software Architect & AI Systems Specialist",
      company: "JPMorgan Chase & Co.",
      period: "Present",
      track: "leadership",
      trackLabel: "Current Terminus (Enterprise Scale & AI)",
      color: "var(--accent-cyan)",
      isHub: true,
      svgPos: { x: 780, y: 320 },
      mandate: "Driving next-generation distributed banking architectures, resilient microservices, and autonomous AI system integration.",
      metrics: [
        { val: "Tier-1", lbl: "Financial Grade Resilience" },
        { val: "10M+", lbl: "Daily Scale Orchestration" }
      ],
      highlights: [
        "Leading architecture and technical strategy for mission-critical financial platforms handling millions in daily volume.",
        "Pioneering the production integration of autonomous LLM workflows, MLOps retrieval pipelines, and AI developer tooling.",
        "Guiding engineering mentorship, RFC architectural reviews, and high-velocity engineering standards across distributed pods."
      ],
      tags: ["JPMorgan Chase", "AI Systems", "Enterprise Architecture", "LLM Pipelines", "Resilient Banking", "Tech Leadership"]
    }
  ],

  ideas: [
    {
      id: "idea-1",
      title: "The Death of Classical CRUD: Why 80% of Enterprise Backends Will Be Agent-Orchestrated by 2028",
      category: "ai",
      categoryLabel: "AI & Architecture",
      horizon: "Horizon: 2026 - 2028",
      conviction: 88,
      convictionLabel: "High Conviction (88%)",
      summary: "Traditional REST APIs and manual SQL queries were designed for human developers wiring up static UIs. Autonomous agents with structured tool-calling are fundamentally shifting backend architectures from deterministic endpoints to goal-driven state transitions.",
      bullets: [
        "Deterministic CRUD endpoints will be replaced by semantic action spaces defined via JSON Schema and OpenAPI contracts.",
        "Database migrations will transition from manual ALTER TABLE scripts to self-healing schema adapters with automated rollback simulations.",
        "Security boundaries will shift from OAuth token scopes to capability-based runtime permission policies verified at execution time."
      ],
      poll: {
        agree: 142,
        disagree: 28
      },
      reactions: {
        fire: 89,
        mindblown: 124,
        insight: 67,
        bullish: 102
      },
      comments: [
        {
          id: "c1-1",
          author: "Elena Rostova",
          role: "VP of Engineering at FinScale",
          time: "2 days ago",
          text: "Strong agree on the shift to semantic action spaces. We're already replacing complex multi-step admin workflows with goal-directed agents backed by strict capability tokens."
        },
        {
          id: "c1-2",
          author: "Marcus Vance",
          role: "Staff Database Architect",
          time: "1 day ago",
          text: "I'm skeptical about automated schema migrations without human in the loop for high-throughput OLTP databases. Data integrity edge cases will still require seasoned DBAs."
        }
      ]
    },
    {
      id: "idea-2",
      title: "The 10x Engineer Myth Is Over: Enter the 10x Systems Conductor",
      category: "leadership",
      categoryLabel: "Tech Culture & Leadership",
      horizon: "Horizon: Happening Now",
      conviction: 93,
      convictionLabel: "High Conviction (93%)",
      summary: "Raw typing speed and syntax memorization have zero moat today. The highest leverage engineers are no longer code churners; they are 'Systems Conductors' who can synthesize business context, architect resilient agentic guardrails, and audit model outputs with surgical precision.",
      bullets: [
        "System decomposition and interface design are 10x more valuable than bespoke algorithm implementations.",
        "The best tech leads will be masters of evaluation harnesses, error budgets, and latency waterfalls.",
        "Code review will evolve from finding syntax nits to verifying behavioral contracts and adversarial edge cases."
      ],
      poll: {
        agree: 210,
        disagree: 14
      },
      reactions: {
        fire: 156,
        mindblown: 98,
        insight: 182,
        bullish: 88
      },
      comments: [
        {
          id: "c2-1",
          author: "Dr. Arthur Pendelton",
          role: "Head of AI Research",
          time: "3 days ago",
          text: "Spot on, Nikhil. We're seeing junior engineers write code faster, but senior conductors are needed more than ever to prevent architectural spaghetti from propagating."
        }
      ]
    },
    {
      id: "idea-3",
      title: "Microservices Regret: The Renaissance of the Isomorphic Modular Monolith",
      category: "systems",
      categoryLabel: "Distributed Systems",
      horizon: "Horizon: 2026 - 2027",
      conviction: 82,
      convictionLabel: "High Conviction (82%)",
      summary: "The premature splitting of early-stage systems into 40+ microservices created millions in network tax, distributed transaction hell, and cognitive overhead. The pendulum is swinging back to well-typed modular monoliths deployed as single artifacts with domain boundaries.",
      bullets: [
        "Network latency and serialization overhead between internal services frequently outweigh horizontal scaling benefits.",
        "Modern language tooling (monorepos, strict package visibility, Rust/Go binary efficiency) makes in-process module communication 1000x faster than REST/gRPC hops.",
        "Split only when team autonomy or compute characteristics (GPU vs CPU) demand physical separation."
      ],
      poll: {
        agree: 178,
        disagree: 42
      },
      reactions: {
        fire: 112,
        mindblown: 76,
        insight: 140,
        bullish: 65
      },
      comments: [
        {
          id: "c3-1",
          author: "Devon Clark",
          role: "Cloud Infrastructure Director",
          time: "4 days ago",
          text: "We spent 2 years unravelling 22 microservices back into 2 well-defined modular services. Our deployment velocity doubled and our AWS bill dropped 40%."
        }
      ]
    },
    {
      id: "idea-4",
      title: "Small On-Device & Private SLMs Will Capture 90% of Vertical Business Automation",
      category: "hottake",
      categoryLabel: "Edge AI & Privacy",
      horizon: "Horizon: 2026 - 2028",
      conviction: 76,
      convictionLabel: "Moderate Conviction (76%)",
      summary: "The assumption that enterprises will continuously stream confidential proprietary telemetry to mega-cloud LLMs is fundamentally flawed. Fine-tuned 3B to 8B parameter models running on private edge nodes deliver lower latency, zero data exfiltration risk, and 100x lower cost per inference.",
      bullets: [
        "Domain-specific distillation frequently beats 70B+ generic models on specialized extraction and workflow execution.",
        "Privacy regulations (GDPR, HIPAA, BFSI) will mandate local compute boundaries for intelligent systems.",
        "Edge hardware (Apple Silicon, neural coprocessors, AMD/Intel NPU) is already capable of 40+ tokens/sec locally."
      ],
      poll: {
        agree: 95,
        disagree: 51
      },
      reactions: {
        fire: 84,
        mindblown: 110,
        insight: 92,
        bullish: 71
      },
      comments: [
        {
          id: "c4-1",
          author: "Kavita Rao",
          role: "Chief Information Security Officer",
          time: "5 days ago",
          text: "Data residency is the #1 hurdle stopping our executive committee from rolling out cloud LLMs to internal banking tools. Local distilled models are our primary R&D focus."
        }
      ]
    }
  ],

  education: [
    {
      id: "edu-1",
      degree: "Executive Specialization in Artificial Intelligence & MLOps",
      school: "UpGrad & Academic Partners (IIIT-B)",
      period: "2023 - 2024",
      colorClass: "cyan",
      details: "Comprehensive specialization covering production MLOps pipelines, Deep Neural Networks (CNNs), Advanced Regression Modeling, and scalable machine learning systems.",
      tags: ["MLOps", "Deep Learning", "Convolutional Neural Networks", "Advanced Regression", "Model Serving"]
    },
    {
      id: "edu-2",
      degree: "Advanced Higher Studies in Computing & Systems Engineering",
      school: "Institutions of Ireland (Dublin / Limerick Tech Ecosystem)",
      period: "2019 - 2021",
      colorClass: "purple",
      details: "Specialized in distributed systems, international software architecture, and cloud infrastructure operations alongside tenure at Dell Technologies Ireland.",
      tags: ["Cloud Infrastructure", "Distributed Computing", "European Tech Ecosystem", "Dell Technologies"]
    },
    {
      id: "edu-3",
      degree: "Bachelor of Engineering in Computer Science & Engineering",
      school: "Vasavi College of Engineering (VCE), Hyderabad",
      period: "2008 - 2012",
      colorClass: "emerald",
      details: "Rigorous academic foundation covering Data Structures, Algorithms, Computer Architecture, Database Management Systems, and Computer Networks.",
      tags: ["Algorithms", "Data Structures", "Computer Architecture", "VCE Hyderabad", "First Class with Distinction"]
    },
    {
      id: "edu-4",
      degree: "Foundational Sciences & Mathematics",
      school: "St Gabriel's High School",
      period: "1989 - 2001",
      colorClass: "amber",
      details: "Early academic foundation with distinction in mathematics, analytical problem solving, and science.",
      tags: ["Foundational Sciences", "Mathematics", "Academic Excellence"]
    }
  ],

  bento: {
    audio: {
      track: "Midnight Cyberdrive // Focus Flow",
      artist: "Nikhil's Deep Work Flow Session",
      genre: "Ambient / Minimal Focus"
    },
    books: [
      {
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        takeaway: "The definitive masterclass on distributed consistency, replication logs, and storage engines."
      },
      {
        title: "High Output Management",
        author: "Andy Grove",
        takeaway: "Leverage is the multiplier of engineering impact. Optimize the bottlenecks that govern team velocity."
      },
      {
        title: "Thinking in Systems",
        author: "Donella Meadows",
        takeaway: "Feedback loops, delays, and resilience parameters define how complex technological systems behave."
      }
    ],
    fitness: {
      goal: "Weekend League Cricket & Physical Endurance",
      weeklyKms: "Competitive Matches & Fitness",
      streak: "24 Weeks",
      mindset: "Competitive cricket builds quick decision-making under match pressure, strategic team synergy, and relentless stamina."
    },
    hardware: {
      item: "Full-Stack & Cloud Developer Workstation",
      specs: "High-throughput development with TypeScript, Python, Docker, and distributed microservices tooling."
    },
    coffee: {
      recipe: "Light Roast Ethiopian Pour-Over (V60)",
      ratio: "1:16 Ratio • 92°C Brew Temp • 2:45 Target Drawdown",
      tastingNotes: "Bergamot, jasmine blossoms, crisp stone fruit acidity."
    },
    travel: {
      cities: ["Hyderabad", "Ireland (Dublin/Limerick)", "London", "Singapore", "Bengaluru", "New York"],
      perspective: "Having engineered systems in India and Ireland across global leaders like JPMorgan Chase and Dell, international perspective fuels my architectural clarity."
    }
  },

  endorsements: [
    {
      id: "end-1",
      author: "Vikram Malhotra",
      role: "Engineering Director, Enterprise Cloud Platforms",
      initials: "VM",
      text: "Nikhil is that rare breed of architect who can zoom into low-level race conditions and latency waterfalls, and then articulate multi-million-dollar technical roadmaps with executive clarity. He raised the bar for our entire engineering practice."
    },
    {
      id: "end-2",
      author: "Sarah Jenkins",
      role: "Global Product Lead, Financial Technology Systems",
      initials: "SJ",
      text: "Partnering with Nikhil was an outstanding experience. He doesn't just review architecture specs; he deeply understands user pain points and engineers resilient technical shortcuts that saved quarters of development time while delivering financial-grade reliability."
    },
    {
      id: "end-3",
      author: "Arjun Reddy",
      role: "Staff Software Engineer & Mentee",
      initials: "AR",
      text: "Nikhil mentored me from senior engineer to tech lead. His emphasis on RFC rigor, defensive systems design, and empathetic communication completely transformed how our pods collaborate. Any global organization is fortunate to have him at the architectural helm."
    }
  ]
};
