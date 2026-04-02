export default function PreviewSection() {
  return (
    <section className="preview-section" id="preview">
      <div className="preview-card glass-card">
        <aside className="preview-media">
          <div className="panel-heading">
            <h3>Uploaded Images</h3>
            <span className="accent-line"></span>
          </div>

          <div className="mock-image mock-image-primary">
            <div className="image-overlay">Sanitation Issue Snapshot</div>
          </div>

          <div className="slider-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>

          <div className="mock-image mock-image-secondary">
            <div className="image-overlay quote">"Join us to build a better tomorrow."</div>
          </div>
        </aside>

        <div className="preview-details">
          <div className="panel-heading">
            <h3>Complaint Details</h3>
            <span className="accent-line"></span>
          </div>

          <div className="details-grid">
            <div>
              <span>Complaint No.</span>
              <strong>GOV-240108</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>Waste Management</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>02/04/2026</strong>
            </div>
            <div>
              <span>Priority</span>
              <strong>High</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>Sector 8 Public Colony</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>Urban Sanitation</strong>
            </div>
          </div>

          <div className="description-box">
            <span>Description</span>
            <p>
              Garbage overflow has not been cleared for several days, causing foul smell
              and hygiene concerns near the residential gate. The AI analyzer would classify
              this under sanitation and mark it as urgent.
            </p>
          </div>

          <div className="status-row">
            <div>
              <span>Status</span>
              <strong>Submitted</strong>
            </div>
            <div>
              <span>Sentiment</span>
              <strong>Negative / Urgent</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
