export interface RoleSkillProfile {
  id: string
  title: string
  category: string
  matchKeywords: string[]
  overview: string
  mustHaveSkills: string[]
  inDemandSkills: string[]
  competitiveEdgeSkills: string[]
  tailoredBulletExamples: {
    skill: string
    bullet: string
    explanation: string
  }[]
  realLifeAdvice: {
    title: string
    action: string
    impact: string
  }[]
}

export const ATS_ROLE_PROFILES: RoleSkillProfile[] = [
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    category: "Engineering",
    matchKeywords: ["frontend", "front-end", "react", "ui engineer", "web developer", "javascript developer", "client-side"],
    overview: "Modern frontend roles require strong mastery of component-driven architectures, type-safe development, performance metrics (Core Web Vitals), and modern styling tooling.",
    mustHaveSkills: [
      "React",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Responsive Design",
      "Git",
      "REST APIs",
    ],
    inDemandSkills: [
      "Next.js",
      "Tailwind CSS",
      "State Management (Zustand/Redux)",
      "Core Web Vitals",
      "GraphQL",
      "Unit Testing (Jest/Vitest)",
      "Webpack / Vite",
    ],
    competitiveEdgeSkills: [
      "Micro-frontends Architecture",
      "WebSockets & Real-time UI",
      "Web Accessibility (WCAG 2.1 AA)",
      "CI/CD Integration",
      "E2E Testing (Playwright/Cypress)",
    ],
    tailoredBulletExamples: [
      {
        skill: "Performance Optimization",
        bullet: "Architected component code-splitting and dynamic asset bundling with Vite, reducing bundle size by 38% and elevating Core Web Vitals LCP from 3.4s to 1.1s.",
        explanation: "Shows quantifiable speed improvements using modern engineering terms that ATS keyword parsers score in the 90th percentile.",
      },
      {
        skill: "Design Systems & Tailwind",
        bullet: "Engineered scalable design system with React, TypeScript, and Tailwind CSS, standardizing UI primitives across 4 enterprise applications and cutting design debt by 45%.",
        explanation: "Demonstrates cross-functional collaboration and systematic code reusability across multiple products.",
      },
      {
        skill: "State Management & APIs",
        bullet: "Implemented client-side data fetching and caching with TanStack Query and Zustand, eliminating redundant HTTP requests by 60% and delivering sub-100ms UI transitions.",
        explanation: "Proves experience handling complex asynchronous state and modern data management.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Explicitly List Core Frameworks & Languages",
        action: "Create a structured 'Technical Skills' section categorizing Languages (TypeScript, JavaScript), Frameworks (React, Next.js), and Styling (Tailwind CSS).",
        impact: "ATS filters automatically scan for exact syntax matches; separating them prevents parsing misclassifications.",
      },
      {
        title: "Quantify Client-Side Performance",
        action: "Always include metrics like lighthouse score improvements, bounce rate reductions, or page load times rather than just 'built web pages'.",
        impact: "Recruiters and hiring managers spend an average of 6 seconds scanning for percentages and measurable business outcomes.",
      },
      {
        title: "Include Testing & Code Quality Keywords",
        action: "Add Jest, React Testing Library, or Cypress even if you only write integration tests.",
        impact: "Over 75% of senior engineering ATS screening rules require at least one automated testing keyword.",
      },
    ],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    category: "Engineering",
    matchKeywords: ["backend", "back-end", "server", "api engineer", "database developer", "distributed systems"],
    overview: "Backend systems roles prioritize robust API design, database query optimization, asynchronous processing, security protocols, and scalable microservice architectures.",
    mustHaveSkills: [
      "Node.js",
      "Python / Go",
      "SQL (PostgreSQL/MySQL)",
      "RESTful API Design",
      "Git",
      "Database Modeling",
      "Authentication (JWT/OAuth)",
      "Object-Oriented Design",
    ],
    inDemandSkills: [
      "Redis / In-memory Caching",
      "Docker & Containerization",
      "Microservices",
      "GraphQL",
      "Message Queues (Kafka/RabbitMQ)",
      "AWS / Cloud Infrastructure",
      "CI/CD Pipelines",
    ],
    competitiveEdgeSkills: [
      "Kubernetes Orchestration",
      "gRPC / Protocol Buffers",
      "Database Sharding & Replication",
      "System Observability (Datadog/Prometheus)",
      "OWASP Security Hardening",
    ],
    tailoredBulletExamples: [
      {
        skill: "Scalable API Architecture",
        bullet: "Designed and deployed 14 high-throughput microservices using Node.js and Go, reliably handling 25,000+ requests per second with 99.98% service uptime.",
        explanation: "Quantifies high load and uptime reliability, which are the #1 criteria for senior backend candidate screens.",
      },
      {
        skill: "Database & Query Optimization",
        bullet: "Optimized complex PostgreSQL queries and implemented Redis multi-tier caching, reducing 95th percentile database latency from 450ms to 28ms.",
        explanation: "Directly demonstrates database internals knowledge and deep performance engineering.",
      },
      {
        skill: "Asynchronous Pipelines",
        bullet: "Constructed distributed event-driven message pipeline using Apache Kafka, processing 5M+ daily transaction logs with zero data loss.",
        explanation: "Highlights enterprise-grade message queuing and event-driven architecture.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Mention Traffic Volumes & Scale",
        action: "State the number of requests per second (RPS), daily active users, or transaction volumes your systems process.",
        impact: "Distinguishes enterprise-grade backend engineers from basic tutorial CRUD developers in automated filters.",
      },
      {
        title: "Highlight Database Optimization Details",
        action: "Mention indexing strategies, schema migrations, and connection pooling explicitly.",
        impact: "Database optimization is the most frequently tested domain during backend technical interviews.",
      },
    ],
  },
  {
    id: "fullstack-developer",
    title: "Full Stack Developer",
    category: "Engineering",
    matchKeywords: ["full stack", "fullstack", "software engineer", "web engineer", "mern", "full-stack"],
    overview: "Full stack engineers must bridge intuitive client-facing design with robust, secure server infrastructure and database management.",
    mustHaveSkills: [
      "React / Vue",
      "Node.js / Express",
      "TypeScript",
      "SQL / PostgreSQL",
      "RESTful APIs",
      "Git & GitHub",
      "HTML5 / CSS3",
      "Cloud Deployment",
    ],
    inDemandSkills: [
      "Next.js / Fullstack Frameworks",
      "Docker",
      "MongoDB / NoSQL",
      "Tailwind CSS",
      "GraphQL",
      "AWS (S3, EC2, Lambda)",
      "Automated Testing",
    ],
    competitiveEdgeSkills: [
      "End-to-End System Architecture",
      "Serverless Architecture",
      "CI/CD Automation",
      "Payment Gateway Integration (Stripe)",
      "Web Security & Rate Limiting",
    ],
    tailoredBulletExamples: [
      {
        skill: "End-to-End Delivery",
        bullet: "Built end-to-end multi-tenant SaaS application from scratch using Next.js 14, TypeScript, PostgreSQL, and Stripe, scaling to 15,000 paid subscribers within 6 months.",
        explanation: "Proves complete product ownership from user interface to billing and database management.",
      },
      {
        skill: "Full-Stack Security & Auth",
        bullet: "Implemented OAuth2 social login, session management with Redis, and role-based access control (RBAC), securing 80+ confidential client endpoints.",
        explanation: "Shows comprehensive security awareness across both frontend client state and backend sessions.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Avoid Generic 'Worked on Both Sides'",
        action: "Break your achievements down into specific frontend impacts (UX, speed) and backend impacts (data integrity, API latency).",
        impact: "Gives recruiters confidence that your skills are deep in both domains rather than shallow across both.",
      },
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist / AI Engineer",
    category: "Data & AI",
    matchKeywords: ["data scientist", "data science", "machine learning", "ai engineer", "ml engineer", "deep learning", "nlp"],
    overview: "Requires rigorous statistics, predictive modeling, machine learning frameworks, data transformation pipelines, and translating business hypotheses into production models.",
    mustHaveSkills: [
      "Python",
      "SQL",
      "Pandas & NumPy",
      "Scikit-learn",
      "Data Visualization (Matplotlib/Seaborn)",
      "Statistics & Hypothesis Testing",
      "Machine Learning Algorithms",
      "Data Cleaning & Feature Engineering",
    ],
    inDemandSkills: [
      "PyTorch / TensorFlow",
      "Large Language Models (LLMs) & Prompt Engineering",
      "FastAPI / Model Deployment",
      "Docker for ML",
      "Cloud ML (AWS SageMaker / GCP Vertex)",
      "Natural Language Processing (NLP)",
      "Time-Series Forecasting",
    ],
    competitiveEdgeSkills: [
      "MLOps & Model Monitoring",
      "Vector Databases (Pinecone/Chroma)",
      "RAG (Retrieval-Augmented Generation)",
      "A/B Testing Frameworks",
      "Distributed Computing (PySpark/Databricks)",
    ],
    tailoredBulletExamples: [
      {
        skill: "Production ML Modeling",
        bullet: "Trained and deployed gradient-boosted churn prediction model using Python and XGBoost, achieving 0.89 AUC and reducing customer attrition by 18% ($1.2M annual savings).",
        explanation: "Links mathematical model performance metrics directly to verified revenue and business value.",
      },
      {
        skill: "Generative AI & LLM Systems",
        bullet: "Engineered Retrieval-Augmented Generation (RAG) system using LangChain, OpenAI API, and Pinecone, reducing support ticket resolution times by 44%.",
        explanation: "Demonstrates highly in-demand practical GenAI and modern vector search expertise.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Tie Model Accuracy Directly to Business ROI",
        action: "Always follow model metrics (F1 score, Precision, RMSE) with business results ($ saved, hours reduced, conversion increase).",
        impact: "Separates academic experimenters from industry-ready data scientists who drive executive value.",
      },
    ],
  },
  {
    id: "devops-engineer",
    title: "DevOps / Cloud Engineer",
    category: "Infrastructure",
    matchKeywords: ["devops", "cloud", "sre", "infrastructure", "platform engineer", "reliability engineer"],
    overview: "Focuses on automated continuous integration, cloud provisioning, infrastructure as code, container orchestration, zero-downtime deployments, and telemetry.",
    mustHaveSkills: [
      "Linux Administration",
      "Docker",
      "Kubernetes (K8s)",
      "CI/CD (GitHub Actions / GitLab CI)",
      "AWS / Azure / GCP",
      "Terraform / Infrastructure as Code",
      "Bash / Python Scripting",
      "Git",
    ],
    inDemandSkills: [
      "Helm Charts",
      "Prometheus & Grafana",
      "ArgoCD / GitOps",
      "Ansible",
      "Security / DevSecOps",
      "Load Balancing & VPC Networking",
      "Log Management (ELK / CloudWatch)",
    ],
    competitiveEdgeSkills: [
      "Multi-Region High Availability",
      "Cost Optimization / FinOps",
      "Chaos Engineering",
      "Service Mesh (Istio)",
      "Compliance Automation (SOC 2, HIPAA)",
    ],
    tailoredBulletExamples: [
      {
        skill: "Infrastructure as Code & CI/CD",
        bullet: "Automated multi-environment cloud provisioning via Terraform and GitHub Actions, slashing deployment cycle times from 4 hours to 12 minutes.",
        explanation: "Demonstrates concrete operational velocity improvements that engineering leaders actively look for.",
      },
      {
        skill: "Kubernetes Cluster Management",
        bullet: "Orchestrated production Kubernetes cluster across 40+ microservices on AWS EKS, configuring horizontal pod autoscaling and reducing cloud spend by 32%.",
        explanation: "Directly proves ability to scale workloads while managing infrastructure costs.",
      },
    ],
    realLifeAdvice: [
      {
        title: "List Specific Cloud Certifications & Tool Chains",
        action: "Include AWS Solutions Architect, CKA (Certified Kubernetes Administrator), or Terraform Associate prominently in your header.",
        impact: "ATS algorithms heavily weight recognized industry certifications for infrastructure positions.",
      },
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Product",
    matchKeywords: ["product manager", "pm", "technical product manager", "product lead", "product owner"],
    overview: "Requires user research, roadmap definition, cross-functional engineering alignment, metric-driven discovery, feature prioritization, and launch execution.",
    mustHaveSkills: [
      "Product Strategy & Roadmapping",
      "User Research & Interviews",
      "Agile & Scrum Methodologies",
      "Data Analytics & SQL",
      "Cross-Functional Team Leadership",
      "PRD & User Story Writing",
      "Feature Prioritization (RICE/MoSCoW)",
      "Jira & Confluence",
    ],
    inDemandSkills: [
      "A/B Testing & Experimentation",
      "Product Analytics (Mixpanel/Amplitude)",
      "Go-to-Market (GTM) Strategy",
      "Stakeholder Management",
      "Customer Journey Mapping",
      "Wireframing (Figma)",
      "Financial Modeling & Pricing",
    ],
    competitiveEdgeSkills: [
      "Technical Architecture Understanding",
      "AI/ML Product Lifecycle",
      "Growth Product Experimentation",
      "B2B Enterprise Sales Alignment",
      "Competitive Landscape Intelligence",
    ],
    tailoredBulletExamples: [
      {
        skill: "Growth & Retention",
        bullet: "Spearheaded redesign of self-serve onboarding funnel based on user drop-off telemetry, elevating 30-day user activation by 27% and generating $450k net new ARR.",
        explanation: "Proves data-backed decision-making tied to bottom-line financial metrics.",
      },
      {
        skill: "Cross-Functional Execution",
        bullet: "Led cross-functional team of 9 engineers and 2 designers using 2-week agile sprints, delivering 3 major product initiatives on time with 98% adoption rate.",
        explanation: "Shows project leadership and consistent execution track record.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Frame Every Point around Problem ➔ Solution ➔ Metric",
        action: "Avoid 'managed backlog' and replace with 'identified friction in checkout, prioritized one-click checkout, raising conversions by 14%'.",
        impact: "Recruiters evaluate PM resumes exclusively based on demonstrated business impact and product intuition.",
      },
    ],
  },
  {
    id: "uiux-designer",
    title: "UI/UX Designer",
    category: "Design",
    matchKeywords: ["ui/ux", "product designer", "ux designer", "ui designer", "interaction designer", "visual designer"],
    overview: "Demands comprehensive design systems, high-fidelity interactive prototyping, user research synthesis, usability testing, and frictionless developer handoff.",
    mustHaveSkills: [
      "Figma",
      "UI & Visual Design",
      "UX Research & Usability Testing",
      "Design Systems & Tokenization",
      "Wireframing & Prototyping",
      "Information Architecture",
      "Responsive Web & Mobile Design",
      "User Journey Mapping",
    ],
    inDemandSkills: [
      "Interactive Components & Micro-interactions",
      "WCAG 2.1 AA Accessibility Standards",
      "Developer Handoff (Zeplin/Storybook)",
      "Design Thinking Workshops",
      "A/B Testing for UX",
      "Analytics-driven UX Iteration",
    ],
    competitiveEdgeSkills: [
      "Basic HTML/CSS/Tailwind Understanding",
      "Motion Design & Micro-animations",
      "Complex B2B Enterprise Workflows",
      "Design System Governance",
      "Design Ops Leadership",
    ],
    tailoredBulletExamples: [
      {
        skill: "Design System Architecture",
        bullet: "Constructed comprehensive Figma design system containing 250+ accessible components with auto-layout and variable tokens, speeding up feature delivery by 40%.",
        explanation: "Demonstrates systematic design thinking and engineering alignment.",
      },
      {
        skill: "User Research & Conversion",
        bullet: "Conducted 30+ moderated usability tests to redesign complex checkout workflow, reducing task abandonment by 31% and elevating CSAT to 4.8/5.",
        explanation: "Proves qualitative research skills backed by quantitative user satisfaction metrics.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Always Include Live Portfolio & Figma Case Study Links",
        action: "Ensure your resume header prominently links your portfolio URL with password-accessible case studies.",
        impact: "Over 90% of design hiring managers will not review an applicant without immediate portfolio access.",
      },
    ],
  },
]

// Fallback generator for custom typed roles
export function getCustomRoleProfile(roleName: string): RoleSkillProfile {
  const clean = roleName.toLowerCase().trim()
  const matched = ATS_ROLE_PROFILES.find((p) =>
    p.matchKeywords.some((kw) => clean.includes(kw)) || clean.includes(p.title.toLowerCase())
  )
  if (matched) return matched

  // Synthesize custom intelligent profile
  return {
    id: "custom-" + clean.replace(/\s+/g, "-"),
    title: roleName,
    category: "Technology",
    matchKeywords: [clean],
    overview: `Targeted analysis customized for ${roleName} roles. Focuses on essential domain competencies, industry standard toolchains, and quantifiable business outcomes.`,
    mustHaveSkills: [
      "Domain Expertise in " + roleName,
      "Agile & Cross-Functional Teamwork",
      "Analytical Problem Solving",
      "Systematic Documentation",
      "Process Optimization",
      "Stakeholder Communication",
      "Quality Assurance",
      "Git / Version Control",
    ],
    inDemandSkills: [
      "Modern Tooling & Automation",
      "Data-Driven Decision Making",
      "Performance Metrics & KPI Tracking",
      "Technical Strategy",
      "Security & Compliance Best Practices",
      "Continuous Improvement",
    ],
    competitiveEdgeSkills: [
      "Cross-Disciplinary Technical Knowledge",
      "Team Mentorship & Technical Leadership",
      "Scalability & Future-Proof Architecture",
    ],
    tailoredBulletExamples: [
      {
        skill: "Impact & Optimization",
        bullet: `Spearheaded key initiatives as ${roleName}, optimizing core workflows and increasing operational efficiency by 30% across cross-functional departments.`,
        explanation: "Highlights initiative ownership and measurable efficiency gains.",
      },
      {
        skill: "Domain Leadership",
        bullet: `Executed strategic deliverables for ${roleName} functions, consistently delivering on-time milestones with 99%+ quality accuracy.`,
        explanation: "Demonstrates reliability and adherence to high industry standards.",
      },
    ],
    realLifeAdvice: [
      {
        title: "Match Exact Job Description Phrasing",
        action: `Review 3-5 real postings for ${roleName} and mirror their exact terminology for tools, methodologies, and frameworks.`,
        impact: "ATS algorithms score exact phrasing 3x higher than synonyms.",
      },
      {
        title: "Use Strong Action Verbs with Metrics",
        action: "Begin every bullet point with action verbs like 'Engineered', 'Optimized', 'Architected', or 'Pioneered' paired with a percentage or dollar figure.",
        impact: "Boosts ATS verb impact ratings and catches hiring manager attention in preliminary scans.",
      },
    ],
  }
}
