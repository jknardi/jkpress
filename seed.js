// seed.js
const db = require('./config/database');

const demoPosts = [
  {
    title: "The Dawn of Botanical Architecture in Modern Metropolises",
    summary: "Exploring how urban architects are integrating living ecosystems directly into skyscraper blueprints to combat rising global temperatures.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urban landscapes are transforming at an unprecedented pace. By embedding vertical forests and bio-reactive facades directly into concrete structures, modern civil engineers are proving that sustainability does not mean sacrificing structural integrity.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. The future of our cities lies within the seamless integration of organic flora and high-performance structural design.</p>",
    image: "https://images.unsplash.com/photo-1512978587787-47fc7ac10b63?q=80&w=489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Singapore", lat: 1.3521, lng: 103.8198
  },
  {
    title: "How Quantum Computing is Reshaping Artificial Intelligence Post-2026",
    summary: "A deep dive into the recent algorithmic breakthroughs combining quantum mechanics with neural networks for instantaneous data retrieval.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. The collision between quantum computing capabilities and neural processing units has yielded historic breakthroughs this year. Traditional encryption models and basic search indices are being outpaced by high-fidelity matrix calculations capable of handling multi-vector data arrays in real-time.</p><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis. AI search engines are no longer just guessing; they are calculating contexts with infinite mathematical precision.</p>",
    image: "https://images.unsplash.com/photo-1765256931541-fc958b88de83?q=80&w=872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "San Francisco, USA", lat: 37.7749, lng: -122.4194
  },
  {
    title: "The New Green Deal: International Treaties and Local Impact",
    summary: "An analysis of the newly ratified global environmental framework and its immediate economic consequences on localized businesses.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. The latest international assembly on carbon mitigation has set strict regulatory baselines for corporate output. However, the true execution relies on municipality-level deployment and regional green incentives.</p><p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur. Local economies must pivot swiftly to capitalize on these new sustainable development funds.</p>",
    image: "https://images.unsplash.com/photo-1722654297530-99842a2351e1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Geneva, Switzerland", lat: 46.2044, lng: 6.1432
  },
  {
    title: "Decentralized Media: Why Stateless Token Architectures are Winning",
    summary: "Why modern publishers are moving away from monolithic platforms like WordPress in favor of lightweight, cryptographically isolated node engines.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Monolithic architectures are facing a critical turning point. As bot traffic from LLM scrapers accelerates globally, traditional content management systems are struggling under heavy database queries and unoptimized rendering trees.</p><p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Lightweight node servers equipped with stateless cryptographic tokens, such as jk-zeto, provide the ultimate defense and speed benchmark required for tomorrow's digital press rooms.</p>",
      image: "https://images.unsplash.com/photo-1740560051614-8c5743c8bd61?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "London, UK", lat: 51.5074, lng: -0.1278
  },
  {
    title: "The Hidden Biodiversity of Hidden Protected Urban Wetlands",
    summary: "A documentation of rare avian and plant species adapting to protected nature sanctuaries nestled deep within Asian mega-cities.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Deep within the industrial heartlands of our primary metropolitan zones, nature is carving out an unexpected sanctuary. Recent environmental surveys indicate a 40% increase in migratory bird nesting sites across newly protected urban wetlands.</p><p>Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Protecting these fragile micro-ecosystems ensures urban heat islands are naturally cooled while maintaining regional ecological balance.</p>",
    image: "https://images.unsplash.com/photo-1722654297530-99842a2351e1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Tokyo, Japan", lat: 35.6762, lng: 139.6503
  },
  {
    title: "Symmetric Cryptography: Securing the Next Generation of Headless CMS",
    summary: "How advanced algorithms like AES-256-GCM protect administrator sessions without the continuous overhead of traditional network authentication.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Security in the modern web cannot rely on transpicuous data formats. As demonstrated by innovative node systems, symmetric encryption methodologies using authenticated data tags (GCM) ensure that session integrity remains absolute from the client browser to the server database.</p><p>Phasellus viverra nulla ut metus varius laoreet. When payloads are encrypted entirely, malicious third parties lose the ability to analyze or dissect active administration tunnels.</p>",
      image: "https://images.unsplash.com/photo-1722654297530-99842a2351e1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Berlin, Germany", lat: 52.5200, lng: 13.4050
  },
  {
    title: "The Rise of Regional Journalism in the Conversational AI Era",
    summary: "Why hyper-local dispatches and geo-targeted press materials are gaining massive traction in modern search engine semantic positioning.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Global search engines and conversational AI systems are radically changing how they evaluate journalism quality. Recent adjustments to algorithmic scrapers reveal a strong preference for authenticated regional dispatches carrying specific geographical coordinate tags.</p><p>Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Readers want to know exactly where the news is breaking, and localized coverage bridges the trust gap created by generic global syndicates.</p>",
    image: "https://images.unsplash.com/photo-1512978587787-47fc7ac10b63?q=80&w=489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456
  },
  {
    title: "Sustainable Tech: Building High-Performance Servers with Low Power",
    summary: "Practical steps developers and systems engineers are taking to reduce server power consumption while maximizing database query speeds.",
    content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. High-performance software engineering is fundamentally linked to environmental sustainability. By eliminating heavy Object-Relational Mapping (ORM) software layers and optimizing indexing on lightweight storage engines like SQLite, developers can slash CPU instruction counts significantly.</p><p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. Less processing translates directly to reduced data center cooling demands and a leaner, faster internet framework.</p>",
   image: "https://images.unsplash.com/photo-1512978587787-47fc7ac10b63?q=80&w=489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426
  }
];

db.serialize(() => {
  console.log("Starting data seeding into JkPress database...");

  const sql = `INSERT INTO posts (
    title, slug, content, summary, featured_image, 
    seo_title, seo_description, focus_keywords,
    geo_location, geo_latitude, geo_longitude, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`;

  let completed = 0;

  demoPosts.forEach((post) => {
    // Generate clean slug automatically
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const params = [
      post.title,
      slug,
      post.content,
      post.summary,
      post.image,
      `${post.title} | The Jk Record`,
      post.summary,
      "journalism, nodejs, architecture",
      post.location,
      post.lat,
      post.lng
    ];

    db.run(sql, params, function(err) {
      if (err) {
        console.log(`❌ Failed to insert: "${post.title}". Error: ${err.message}`);
      } else {
        console.log(`✅ Successfully seeded: "${post.title}" (ID: ${this.lastID})`);
      }
      
      completed++;
      if (completed === demoPosts.length) {
        console.log("\n=================================================");
        console.log("🎉 Data seeding complete! All 8 premium articles are live.");
        console.log("=================================================");
        db.close();
        process.exit(0);
      }
    });
  });
});
