/* ===================================================================
   PORTFOLIO CMS & BLOGGING SERVICE
   Handles real-time Firestore database queries for:
   - Dynamic Portfolio Content
   - Blog Posts & Perspectives
   - Reader Discussion Comments & Moderation
   =================================================================== */

// Initial starter blog posts (rendered when in offline/local mode or pre-seeding)
const DEFAULT_POSTS = [
  {
    id: "post-architecting-financial-microservices",
    slug: "architecting-financial-microservices",
    title: "Architecting Ultra-Resilient Financial Microservices: Lessons from Wall Street Scale",
    category: "Architecture",
    tags: ["Distributed Systems", "Java Spring Boot", "Financial Tech", "Microservices"],
    excerpt: "How we design zero-data-loss event streaming architectures processing millions of high-concurrency transactions daily with sub-second SLAs.",
    content: `## The Imperative for Deterministic Reliability

In modern Tier-1 investment banking infrastructure, 99.99% availability is not merely a service-level target—it is an existential requirement. When handling multi-million-dollar transactions across distributed ledger nodes, standard failover patterns fall short.

### 1. Dual-Phase Commit vs. Saga Patterns

While distributed transactions traditionally relied on two-phase commit (2PC) protocols, horizontal microservice topologies require asynchronous orchestration. We implement **choreographed Saga patterns** paired with Kafka event sourcing:

* **Idempotent Consumers**: Every message payload contains a deterministic trace identifier and sequence hash. Even under network partitioning or duplicate delivery, state mutations occur exactly once.
* **Compensating Transactions**: If a downstream settlement fails, rollback events execute reversely in strict dependency order.
* **Dead Letter Queues with Automated Replay**: Transient network drops are handled by exponential backoff jitter with circuit breakers (Resilience4j).

\`\`\`java
@CircuitBreaker(name = "transactionService", fallbackMethod = "executeCompensatingFlow")
@Retry(name = "transactionService")
public CompletableFuture<SettlementResponse> processSettlement(PaymentInstruction instruction) {
    return eventPublisher.publishTransactionEvent(instruction)
        .thenCompose(ack -> ledgerClient.recordEntry(instruction));
}
\`\`\`

### 2. Cache Invalidation & In-Memory Consistency

To meet sub-10 millisecond query SLAs, we combine multi-region Redis clusters with local Guava L1 caches. Cache invalidation relies on change-data-capture (CDC) triggers from Oracle GoldenGate streaming into Kafka.

---

### Conclusion

Engineering at financial scale requires shifting from optimistic assumptions to rigorous defensive design: assuming networks will fail, disks will fill, and external dependencies will spike latency. Architectural clarity lies in designing systems that heal gracefully without human intervention.`,
    coverUrl: "",
    authorName: "Nikhil Mothkuri",
    authorRole: "Lead Software Architect",
    authorAvatar: "assets/avatar.jpg",
    readTime: "6 min read",
    status: "published",
    createdAt: "2026-11-08T10:00:00Z"
  },
  {
    id: "post-autonomous-llm-agents-enterprise",
    slug: "autonomous-llm-agents-enterprise",
    title: "Deploying Autonomous LLM Agents in Regulated Enterprise Ecosystems",
    category: "AI & ML",
    tags: ["LLM Agents", "MLOps", "Model Guardrails", "Enterprise AI"],
    excerpt: "Moving beyond basic prompt engineering to deterministic tool-calling agent architectures with strict safety guardrails and auditability.",
    content: `## Beyond Toy Chatbots: The Enterprise AI Frontier

The transition from exploratory conversational interfaces to enterprise-grade autonomous reasoning agents requires solving three fundamental challenges: **hallucination prevention**, **deterministic tool execution**, and **regulatory compliance**.

### The Three Pillars of Enterprise Agentic Design

1. **Context Routing & Retrieval-Augmented Generation (RAG)**
   Rather than dumping unbounded context windows into an LLM, our architecture uses hierarchical vector chunking, hybrid BM25 + dense embedding retrieval, and cross-encoder reranking.

2. **Deterministic Tool Sandboxes**
   Agents do not directly execute arbitrary database mutations. Instead, they propose a structured JSON schema payload validated by deterministic runtime schemas before any external API is called.

3. **Defensive Guardrails & Evaluation Harnesses**
   Every prompt and response is evaluated against input red-teaming filters and output toxicity / leakage scans before returning to the caller.

\`\`\`typescript
interface AgentActionPlan {
  rationale: string;
  proposedAction: string;
  toolParameters: Record<string, unknown>;
  confidenceScore: number;
}
\`\`\`

---

### Key Takeaway

Enterprise AI is 80% systems engineering and 20% model tuning. The real differentiator is building the rigorous software scaffolds that surround probabilistic foundation models with deterministic guarantees.`,
    coverUrl: "",
    authorName: "Nikhil Mothkuri",
    authorRole: "AI Systems Specialist",
    authorAvatar: "assets/avatar.jpg",
    readTime: "5 min read",
    status: "published",
    createdAt: "2026-11-04T14:30:00Z"
  },
  {
    id: "post-international-engineering-leadership",
    slug: "international-engineering-leadership",
    title: "Leading High-Impact Engineering Teams Across Cultures and Borders",
    category: "Leadership",
    tags: ["Engineering Leadership", "Global Culture", "RFC Governance", "Mentorship"],
    excerpt: "Insights from leading distributed software engineering pods across Ireland (Dell Technologies) and India (JPMorgan & Oracle).",
    content: `## The Art of Cross-Continental Architecture

Having spent years architecting systems across Dublin, Limerick, and Hyderabad, I have witnessed firsthand that technical excellence is deeply intertwined with cultural empathy and communication clarity.

### Principles for Global Engineering Velocity

* **Asynchronous-First RFC Culture**: Architectural decisions should not happen in ephemeral ad-hoc meetings. Writing structured Requests for Comments (RFCs) forces authors to think through edge cases and gives engineers across different time zones equal voice.
* **Empowerment with Guardrails**: High-performing teams don't require micromanagement. Define clear architectural guardrails, automated linting, CI/CD gates, and SLO metrics, then give pods complete ownership over implementation.
* **Psychological Safety & Blameless Postmortems**: When a production incident occurs, focus 100% on system vulnerabilities rather than individual fault. Every failure is an opportunity to harden the architecture.

---

Great software architecture is fundamentally about people: aligning disparate teams toward a shared technical vision that outlasts any single contributor.`,
    coverUrl: "",
    authorName: "Nikhil Mothkuri",
    authorRole: "Lead Software Architect",
    authorAvatar: "assets/avatar.jpg",
    readTime: "4 min read",
    status: "published",
    createdAt: "2026-10-28T09:15:00Z"
  }
];

class CmsService {
  constructor() {
    this.COLLECTION_POSTS = "posts";
    this.COLLECTION_COMMENTS = "comments";
    this.DOC_PORTFOLIO = "portfolio/main";
    this.LOCAL_POSTS_KEY = "nikhil_local_blog_posts";
    this.LOCAL_COMMENTS_KEY = "nikhil_local_comments";
  }

  /* ===================================================================
     PORTFOLIO DYNAMIC CONTENT SYNC
     =================================================================== */

  // Load portfolio data from Cloud Firestore (falls back to window.PORTFOLIO_DATA)
  async getPortfolioData() {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      try {
        const docRef = db.doc(this.DOC_PORTFOLIO);
        const snapshot = await docRef.get();
        if (snapshot.exists) {
          const liveData = snapshot.data();
          if (liveData && liveData.profile) {
            console.log("✓ Dynamic portfolio data loaded from Cloud Firestore");
            return liveData;
          }
        }
      } catch (e) {
        console.warn("Could not fetch Firestore portfolio data, using local schema:", e);
      }
    }
    // Fallback to static data.js
    return window.PORTFOLIO_DATA || {};
  }

  // Save portfolio data to Cloud Firestore
  async savePortfolioData(data) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (!db) {
      throw new Error("Firebase is not connected. Configure your project in js/firebase-config.js to enable live cloud saving.");
    }
    const docRef = db.doc(this.DOC_PORTFOLIO);
    await docRef.set(data, { merge: true });
    // Also update window.PORTFOLIO_DATA in memory
    Object.assign(window.PORTFOLIO_DATA, data);
    return true;
  }

  /* ===================================================================
     BLOG POSTS SERVICE
     =================================================================== */

  // Get list of blog posts
  async getPosts(filter = {}) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      try {
        let query = db.collection(this.COLLECTION_POSTS);
        if (filter.category && filter.category !== "All") {
          query = query.where("category", "==", filter.category);
        }
        query = query.orderBy("createdAt", "desc");
        const snapshot = await query.get();
        if (!snapshot.empty) {
          const posts = [];
          snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
          return posts;
        }
      } catch (e) {
        console.warn("Firestore posts fetch error, falling back to local posts:", e);
      }
    }

    // Local / Offline storage fallback
    try {
      const stored = localStorage.getItem(this.LOCAL_POSTS_KEY);
      if (stored) {
        let posts = JSON.parse(stored);
        if (filter.category && filter.category !== "All") {
          posts = posts.filter(p => p.category === filter.category);
        }
        return posts;
      }
    } catch (e) {
      console.warn("Local storage parse error:", e);
    }

    // Return default pre-seeded posts
    let posts = [...DEFAULT_POSTS];
    if (filter.category && filter.category !== "All") {
      posts = posts.filter(p => p.category === filter.category);
    }
    return posts;
  }

  // Get single post by ID or Slug
  async getPost(idOrSlug) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      try {
        // Try by ID directly
        const doc = await db.collection(this.COLLECTION_POSTS).doc(idOrSlug).get();
        if (doc.exists) return { id: doc.id, ...doc.data() };

        // Try by Slug query
        const query = await db.collection(this.COLLECTION_POSTS).where("slug", "==", idOrSlug).limit(1).get();
        if (!query.empty) {
          const d = query.docs[0];
          return { id: d.id, ...d.data() };
        }
      } catch (e) {
        console.warn("Firestore getPost error:", e);
      }
    }

    // Check local fallback
    const posts = await this.getPosts();
    return posts.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  // Save / Update Blog Post
  async savePost(post) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    const postData = {
      ...post,
      slug: post.slug || this.slugify(post.title),
      readTime: post.readTime || this.calculateReadTime(post.content),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      if (postData.id) {
        const id = postData.id;
        delete postData.id;
        await db.collection(this.COLLECTION_POSTS).doc(id).set(postData, { merge: true });
        return { id, ...postData };
      } else {
        postData.createdAt = new Date().toISOString();
        const ref = await db.collection(this.COLLECTION_POSTS).add(postData);
        return { id: ref.id, ...postData };
      }
    } else {
      // Local fallback
      let posts = await this.getPosts();
      if (!postData.id) {
        postData.id = "local-" + Date.now();
        postData.createdAt = new Date().toISOString();
        posts.unshift(postData);
      } else {
        const idx = posts.findIndex(p => p.id === postData.id);
        if (idx !== -1) posts[idx] = postData;
        else posts.unshift(postData);
      }
      localStorage.setItem(this.LOCAL_POSTS_KEY, JSON.stringify(posts));
      return postData;
    }
  }

  // Delete Blog Post
  async deletePost(postId) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      await db.collection(this.COLLECTION_POSTS).doc(postId).delete();
    } else {
      let posts = await this.getPosts();
      posts = posts.filter(p => p.id !== postId);
      localStorage.setItem(this.LOCAL_POSTS_KEY, JSON.stringify(posts));
    }
    return true;
  }

  /* ===================================================================
     READER COMMENTS & DISCUSSION
     =================================================================== */

  // Subscribe to real-time comments for a given post
  subscribeComments(postId, callback) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      try {
        return db.collection(this.COLLECTION_COMMENTS)
          .where("postId", "==", postId)
          .orderBy("createdAt", "asc")
          .onSnapshot(
            snapshot => {
              const comments = [];
              snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
              callback(comments);
            },
            err => {
              console.warn("Firestore comments error:", err);
              // Fallback to local
              callback(this.getLocalComments(postId));
            }
          );
      } catch (e) {
        console.warn("Comments subscription error:", e);
      }
    }
    // Return local comments once
    callback(this.getLocalComments(postId));
    return () => {};
  }

  // Get local comments fallback
  getLocalComments(postId) {
    try {
      const stored = localStorage.getItem(this.LOCAL_COMMENTS_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        return (all[postId] || []);
      }
    } catch (e) {
      console.warn("Could not read local comments:", e);
    }
    return [
      {
        id: "sample-c1",
        postId: postId,
        authorName: "Anand R.",
        authorEmail: "anand.tech@example.com",
        authorPhoto: "",
        content: "Outstanding insights on idempotent Kafka saga patterns! We faced similar settlement reconciliation bottlenecks and adopting deterministic sequence hashes made a massive difference.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        isAdmin: false
      }
    ];
  }

  // Add Comment to Post
  async addComment(postId, content, user) {
    if (!content || !content.trim()) throw new Error("Comment text cannot be empty.");
    if (!user) throw new Error("Please log in with your email to post a comment.");

    const commentData = {
      postId: postId,
      content: content.trim(),
      authorId: user.uid || "local-uid",
      authorName: user.displayName || user.email.split("@")[0],
      authorEmail: user.email,
      authorPhoto: user.photoURL || "",
      isAdmin: window.firebaseService ? window.firebaseService.isAdmin(user) : false,
      createdAt: new Date().toISOString()
    };

    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      const ref = await db.collection(this.COLLECTION_COMMENTS).add(commentData);
      return { id: ref.id, ...commentData };
    } else {
      // Local fallback
      commentData.id = "local-c-" + Date.now();
      const all = {};
      try {
        const stored = localStorage.getItem(this.LOCAL_COMMENTS_KEY);
        if (stored) Object.assign(all, JSON.parse(stored));
      } catch (e) {}
      if (!all[postId]) all[postId] = this.getLocalComments(postId);
      all[postId].push(commentData);
      localStorage.setItem(this.LOCAL_COMMENTS_KEY, JSON.stringify(all));
      return commentData;
    }
  }

  // Delete Comment (Admin or Author)
  async deleteComment(commentId, postId) {
    const db = window.firebaseService ? window.firebaseService.getDb() : null;
    if (db) {
      await db.collection(this.COLLECTION_COMMENTS).doc(commentId).delete();
    } else {
      try {
        const stored = localStorage.getItem(this.LOCAL_COMMENTS_KEY);
        if (stored) {
          const all = JSON.parse(stored);
          if (all[postId]) {
            all[postId] = all[postId].filter(c => c.id !== commentId);
            localStorage.setItem(this.LOCAL_COMMENTS_KEY, JSON.stringify(all));
          }
        }
      } catch (e) {}
    }
    return true;
  }

  /* Utility functions */
  slugify(text) {
    return text.toString().toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  calculateReadTime(content) {
    const words = (content || "").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }
}

// Global instantiation
window.cmsService = new CmsService();
