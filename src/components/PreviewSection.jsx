import { formatComplaintDate, getComplaintImageUrl } from "../utils/complaints.js";

export default function PreviewSection({ complaint, isLoading }) {
  const complaintImageUrl = getComplaintImageUrl(complaint);

  return (
    <section className="preview-section" id="preview">
      <div className="preview-card glass-card">
        <aside className="preview-media">
          <div className="panel-heading">
            <h3>Latest Submitted Complaint</h3>
            <span className="accent-line"></span>
          </div>

          {isLoading ? (
            <div className="preview-empty-state">
              <h4>Loading snapshot...</h4>
              <p>Your most recent complaint is being prepared.</p>
            </div>
          ) : complaint ? (
            <>
              <div className="preview-live-image">
                {complaintImageUrl ? (
                  <img
                    src={complaintImageUrl}
                    alt={`${complaint.category} complaint preview`}
                    className="preview-live-image-asset"
                  />
                ) : (
                  <div className="preview-live-image-fallback">
                    <span>{complaint.category}</span>
                    <strong>No image uploaded</strong>
                  </div>
                )}
                <div className="image-overlay">{complaint.category} complaint snapshot</div>
              </div>

              <div className="preview-side-card">
                <span className="preview-side-label">Last Update</span>
                <strong>{complaint.status}</strong>
                <p>
                  Submitted on {formatComplaintDate(complaint.createdAt)} for{" "}
                  {complaint.publicLocation || complaint.location?.address}.
                </p>
              </div>
            </>
          ) : (
            <div className="preview-empty-state">
              <h4>No complaints submitted yet</h4>
              <p>Once you submit a grievance, the latest one will appear here automatically.</p>
            </div>
          )}
        </aside>

        <div className="preview-details">
          <div className="panel-heading">
            <h3>Complaint Details</h3>
            <span className="accent-line"></span>
          </div>

          {isLoading ? (
            <div className="preview-empty-state preview-empty-state-inline">
              <h4>Loading complaint details...</h4>
              <p>Your last complaint details will show here shortly.</p>
            </div>
          ) : complaint ? (
            <>
              <div className="details-grid">
                <div>
                  <span>Complaint No.</span>
                  <strong>{complaint.complaintId}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{complaint.category}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{formatComplaintDate(complaint.createdAt)}</strong>
                </div>
                <div>
                  <span>Priority</span>
                  <strong>{complaint.priority || "Medium"}</strong>
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

              <div className="description-box">
                <span>Description</span>
                <p>{complaint.description}</p>
              </div>

              <div className="status-row">
                <div>
                  <span>Status</span>
                  <strong>{complaint.status}</strong>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>{complaint.contactPhone || "Not available"}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="preview-empty-state preview-empty-state-inline">
              <h4>No snapshot available yet</h4>
              <p>Submit a complaint and we will show the newest one here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
