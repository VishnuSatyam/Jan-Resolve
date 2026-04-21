import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { apiBaseUrl } from "../utils/complaints.js";

const categoryOptions = [
  "Water Supply",
  "Electricity",
  "Road Safety",
  "Waste Management",
  "Healthcare"
];

const initialForm = {
  name: "",
  phone: "",
  location: "",
  category: categoryOptions[0],
  description: "",
  image: null
};

const isValidPhoneNumber = (phone) => /^[6-9]\d{9}$/.test(phone.trim());

export default function SubmitComplaintPage() {
  const { accessToken, currentUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    ...initialForm,
    name: currentUser?.name ?? ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    setFormData((currentForm) => ({
      ...currentForm,
      image: file
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!isValidPhoneNumber(formData.phone)) {
      nextErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!formData.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (formData.description.trim().length < 20) {
      nextErrors.description = "Description should be at least 20 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showToast({ message: "Please fix the form errors before submitting.", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", currentUser?.email ?? "");
      payload.append("phone", formData.phone.trim());
      payload.append("location", formData.location.trim());
      payload.append("category", formData.category);
      payload.append("description", formData.description.trim());

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch(`${apiBaseUrl}/api/complaints`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: payload
      });

      const rawResponse = await response.text();
      let result = null;

      if (rawResponse) {
        try {
          result = JSON.parse(rawResponse);
        } catch {
          throw new Error("Server returned an invalid response. Please check that the backend is running.");
        }
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to submit complaint right now.");
      }

      setComplaintId(result.complaintId);
      setFormData({
        ...initialForm,
        name: currentUser?.name ?? ""
      });
      setErrors({});
      showToast({ message: "Complaint submitted successfully.", type: "success" });
    } catch (error) {
      const fallbackMessage =
        error instanceof TypeError
          ? "Cannot reach the complaint server. Start the app with npm run dev and try again."
          : error.message;

      showToast({ message: fallbackMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="aurora aurora-one"></div>
      <div className="aurora aurora-two"></div>
      <div className="grid-texture"></div>

      <main className="app-frame">
        <section className="submit-screen">
          <div className="submit-header glass-card">
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

            <div className="submit-header-copy">
              <div className="eyebrow">Submit A Complaint</div>
              <h1>Register a grievance in a few clear steps.</h1>
              <p>
                Share the issue details, location, and an optional image. Your submission
                will be stored in the backend and assigned a complaint ID immediately.
              </p>
            </div>
          </div>

          <div className="submit-card glass-card">
            {complaintId ? (
              <div className="confirmation-panel">
                <div className="eyebrow">Submitted Successfully</div>
                <h2>Complaint submitted successfully</h2>
                <p>
                  Your grievance has been recorded. Keep this complaint ID for tracking and
                  follow-up.
                </p>
                <div className="confirmation-id">{complaintId}</div>
                <div className="confirmation-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => setComplaintId("")}
                  >
                    Submit Another Complaint
                  </button>
                  <Link className="ghost-button" to="/home">
                    Back To Home
                  </Link>
                  <Link className="ghost-button" to="/history">
                    View History
                  </Link>
                </div>
              </div>
            ) : (
              <form className="complaint-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>
                    <span>Full Name</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name ? <small className="field-error">{errors.name}</small> : null}
                  </label>

                  <label>
                    <span>Phone Number</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                    />
                    {errors.phone ? <small className="field-error">{errors.phone}</small> : null}
                  </label>
                </div>

                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter complaint location"
                    required
                  />
                  {errors.location ? <small className="field-error">{errors.location}</small> : null}
                </label>

                <label>
                  <span>Category</span>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categoryOptions.map((categoryOption) => (
                      <option key={categoryOption} value={categoryOption}>
                        {categoryOption}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail"
                    rows="6"
                    required
                  />
                  {errors.description ? (
                    <small className="field-error">{errors.description}</small>
                  ) : null}
                </label>

                <label className="file-field">
                  <span>Upload Image (Optional)</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  <div className="file-hint">
                    {formData.image?.name || "Attach a supporting photo if available"}
                  </div>
                </label>

                <div className="form-actions">
                  <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                  <Link className="ghost-button" to="/home">
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
