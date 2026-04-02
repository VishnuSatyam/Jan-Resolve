import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

const initialSignInForm = {
  email: "",
  password: ""
};

const initialRegisterForm = {
  name: "",
  email: "",
  password: ""
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { register, signIn } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("signin");
  const [authMessage, setAuthMessage] = useState(
    "Demo mode: sign in with your saved account to access the landing page."
  );
  const [signInForm, setSignInForm] = useState(initialSignInForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (targetTab) => {
    setActiveTab(targetTab);
    setAuthMessage(
      targetTab === "signin"
        ? "Demo mode: sign in with your saved account to access the landing page."
        : "Demo mode: your registration is stored locally in this browser only."
    );
  };

  const handleSignInSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = signIn({
      email: signInForm.email.trim(),
      password: signInForm.password
    });

    if (!result.ok) {
      setAuthMessage(result.error);
      showToast({ message: result.error, type: "error" });
      setIsSubmitting(false);

      if (result.error.includes("Please create one first")) {
        handleTabChange("register");
      }

      return;
    }

    setAuthMessage(`Welcome back, ${result.user.name}.`);
    setSignInForm(initialSignInForm);
    showToast({ message: `Welcome back, ${result.user.name}.`, type: "success" });
    navigate("/home", { replace: true });
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const nextUser = register({
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password
    });

    setAuthMessage("Registration successful. Entering the landing page now.");
    setRegisterForm(initialRegisterForm);
    showToast({ message: `Account created for ${nextUser.name}.`, type: "success" });
    navigate("/home", { replace: true });
    setIsSubmitting(false);
  };

  return (
    <div className="page-shell">
      <div className="aurora aurora-one"></div>
      <div className="aurora aurora-two"></div>
      <div className="grid-texture"></div>

      <main className="app-frame">
        <section className="auth-screen">
          <div className="auth-copy glass-card">
            <Link className="brand-link home-reset" to="/">
              <div className="brand-badge image-badge">
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

            <div className="eyebrow">Government Service Intelligence</div>
            <h1>Jan Resolve for faster, clearer public grievance handling.</h1>
            <p>
              A modern complaint platform concept that helps citizens register issues,
              helps departments respond quickly, and presents the whole journey in a clean,
              trustworthy interface.
            </p>

            <div className="feature-strip">
              <article>
                <span>AI Classification</span>
                <p>Detects category from natural language complaints.</p>
              </article>
              <article>
                <span>Urgency Insight</span>
                <p>Highlights emotional tone and service-critical complaints.</p>
              </article>
              <article>
                <span>Transparent Tracking</span>
                <p>Keeps citizens updated from submission to resolution.</p>
              </article>
            </div>
          </div>

          <div className="auth-panel glass-card">
            <div className="auth-brand">
              <Link className="brand-link compact home-reset" to="/">
                <div className="brand-badge image-badge">
                  <img
                    src="https://i.ibb.co/Y4VLxJW8/Jan-resolve.png"
                    alt="Jan Resolve logo"
                    className="brand-image"
                  />
                </div>
                <div>
                  <h2>Jan Resolve</h2>
                  <p>Register or sign in to continue to the landing page.</p>
                </div>
              </Link>
            </div>

            <div className="auth-tabs">
              <button
                className={`tab-button ${activeTab === "signin" ? "active" : ""}`}
                type="button"
                onClick={() => handleTabChange("signin")}
              >
                Sign In
              </button>
              <button
                className={`tab-button ${activeTab === "register" ? "active" : ""}`}
                type="button"
                onClick={() => handleTabChange("register")}
              >
                Register
              </button>
            </div>

            {activeTab === "signin" ? (
              <form className="auth-form active" onSubmit={handleSignInSubmit}>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="citizen@example.com"
                    required
                    value={signInForm.email}
                    onChange={(event) =>
                      setSignInForm((currentForm) => ({
                        ...currentForm,
                        email: event.target.value
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Enter password"
                    required
                    value={signInForm.password}
                    onChange={(event) =>
                      setSignInForm((currentForm) => ({
                        ...currentForm,
                        password: event.target.value
                      }))
                    }
                  />
                </label>
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form className="auth-form active" onSubmit={handleRegisterSubmit}>
                <label>
                  <span>Full Name</span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    required
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((currentForm) => ({
                        ...currentForm,
                        name: event.target.value
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((currentForm) => ({
                        ...currentForm,
                        email: event.target.value
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Create Password</span>
                  <input
                    type="password"
                    placeholder="Create password"
                    required
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((currentForm) => ({
                        ...currentForm,
                        password: event.target.value
                      }))
                    }
                  />
                </label>
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            <p className="auth-note">{authMessage}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
