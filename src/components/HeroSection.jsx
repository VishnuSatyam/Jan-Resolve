export default function HeroSection({ onViewSnapshot }) {
  return (
    <section className="hero-section glass-card" id="home">
      <div className="hero-copy">
        <div className="eyebrow">AI + NLP for Public Services</div>
        <h1>Transform citizen complaints into organized action.</h1>
        <p>
          Built for government workflows, this concept interface makes complaint reporting,
          smart analysis, and progress tracking feel reliable, modern, and transparent.
        </p>

        <div className="hero-actions">
          <a className="primary-button" href="#about">
            Explore Platform
          </a>
          <button className="ghost-button" type="button" onClick={onViewSnapshot}>
            View Complaint Snapshot
          </button>
        </div>

        <div className="hero-metrics">
          <article>
            <strong>92%</strong>
            <span>Faster routing potential</span>
          </article>
          <article>
            <strong>24/7</strong>
            <span>Complaint intake support</span>
          </article>
          <article>
            <strong>5+</strong>
            <span>Public service categories</span>
          </article>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-orb"></div>
        <div className="dashboard-card">
          <div className="dashboard-top">
            <span className="status-pill">Live Civic Intelligence</span>
            <span className="mini-dot"></span>
          </div>
          <h3>Department Routing Summary</h3>
          <div className="mini-bars">
            <div>
              <span>Water Supply</span>
              <strong>32%</strong>
            </div>
            <div>
              <span>Electricity</span>
              <strong>21%</strong>
            </div>
            <div>
              <span>Road Safety</span>
              <strong>18%</strong>
            </div>
            <div>
              <span>Healthcare</span>
              <strong>15%</strong>
            </div>
          </div>
          <p className="dashboard-note">
            Complaint urgency and category detection update in near real time.
          </p>
        </div>
      </div>
    </section>
  );
}
