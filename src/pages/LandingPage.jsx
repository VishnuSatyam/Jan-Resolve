import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import PreviewSection from "../components/PreviewSection";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

export default function LandingPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const scrollToPreview = () => {
    document.getElementById("preview")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const handleLogout = () => {
    signOut();
    showToast({ message: "You have been logged out.", type: "info" });
    navigate("/", { replace: true });
  };

  return (
    <div className="page-shell">
      <div className="aurora aurora-one"></div>
      <div className="aurora aurora-two"></div>
      <div className="grid-texture"></div>

      <main className="app-frame">
        <section className="landing-screen">
          <Navbar onLogout={handleLogout} onOpenPreview={scrollToPreview} />
          <HeroSection onViewSnapshot={scrollToPreview} />

          <section className="info-section" id="about">
            <article className="glass-card section-card">
              <div className="eyebrow">About The Project</div>
              <h3>Why this system matters</h3>
              <p>
                Manual complaint sorting slows down public service response. This platform
                introduces AI-powered classification, urgency detection, and department routing
                to reduce delays and improve trust.
              </p>
            </article>

            <article className="glass-card section-card" id="services">
              <div className="eyebrow">Problem Solved</div>
              <h3>Smarter handling of large complaint volumes</h3>
              <p>
                Citizens often report issues about water, electricity, roads, sanitation,
                and safety. The interface is designed to help users submit clearly and help
                departments act faster with data-backed prioritization.
              </p>
            </article>
          </section>

          <PreviewSection />
          <Footer />
        </section>
      </main>
    </div>
  );
}
