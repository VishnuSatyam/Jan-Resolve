import { Link } from "react-router-dom";
import { useComplaintHistory } from "../hooks/useComplaintHistory.jsx";
import { formatComplaintDate, getComplaintImageUrl } from "../utils/complaints.js";

export default function ComplaintHistoryPage() {
  const { complaints, isLoading, error } = useComplaintHistory();

  return (
    <div className="page-shell">
      <div className="aurora aurora-one"></div>
      <div className="aurora aurora-two"></div>
      <div className="grid-texture"></div>

      <main className="app-frame">
        <section className="history-screen">
          <div className="history-header glass-card">
            <Link className="brand-link compact home-reset" to="/home">
              <div className="logo-mark">
                <img
                  src="https://i.ibb.co/Y4VLxJW8/Jan-resolve.png"
                  alt="Jan Resolve logo"
                  className="brand-image"
                />
              </div>
              <div>
                <p className="logo-kicker">Citizen Grievance Platform</p>
                <h2>Jan Resolve</h2>
              </div>
            </Link>

            <div className="history-header-copy">
              <div className="eyebrow">Complaint History</div>
              <h1>Track everything you have submitted so far.</h1>
              <p>
                Review your complaint IDs, status, uploaded image, and the latest grievance
                details in one place.
              </p>
            </div>

            <div className="history-header-actions">
              <Link className="primary-button" to="/submit">
                Submit New Complaint
              </Link>
              <Link className="ghost-button" to="/home">
                Back To Home
              </Link>
            </div>
          </div>

          <div className="history-body glass-card">
            {isLoading ? (
              <div className="history-empty-state">
                <h3>Loading complaint history...</h3>
                <p>Your recent submissions are being fetched.</p>
              </div>
            ) : error ? (
              <div className="history-empty-state">
                <h3>Unable to load your complaint history</h3>
                <p>{error}</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="history-empty-state">
                <h3>No complaints submitted yet</h3>
                <p>Your submitted grievances will appear here as soon as you file one.</p>
                <Link className="primary-button" to="/submit">
                  Submit Your First Complaint
                </Link>
              </div>
            ) : (
              <div className="history-list">
                {complaints.map((complaint) => {
                  const complaintImageUrl = getComplaintImageUrl(complaint);

                  return (
                    <article key={complaint._id || complaint.complaintId} className="history-card">
                      <div className="history-card-media">
                        {complaintImageUrl ? (
                          <img
                            src={complaintImageUrl}
                            alt={`${complaint.category} complaint`}
                            className="history-card-image"
                          />
                        ) : (
                          <div className="history-card-image history-card-image-fallback">
                            <span>{complaint.category}</span>
                            <strong>No image uploaded</strong>
                          </div>
                        )}
                      </div>

                      <div className="history-card-content">
                        <div className="history-card-top">
                          <div>
                            <p className="history-card-id">{complaint.complaintId}</p>
                            <h3>{complaint.title}</h3>
                          </div>
                          <span className="history-status-pill">{complaint.status}</span>
                        </div>

                        <div className="history-meta-grid">
                          <div>
                            <span>Date</span>
                            <strong>{formatComplaintDate(complaint.createdAt)}</strong>
                          </div>
                          <div>
                            <span>Category</span>
                            <strong>{complaint.category}</strong>
                          </div>
                          <div>
                            <span>Location</span>
                            <strong>{complaint.publicLocation || complaint.location?.address}</strong>
                          </div>
                          <div>
                            <span>Department</span>
                            <strong>{complaint.assignedDepartment || "General"}</strong>
                          </div>
                        </div>

                        <div className="history-description">
                          <span>Description</span>
                          <p>{complaint.description}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
