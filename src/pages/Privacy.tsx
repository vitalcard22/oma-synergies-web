import Header from '../components/Header';
import Footer from '../components/Footer';
import './Privacy.css';

export default function Privacy() {
  return (
    <>
      <Header />
      <div className="privacy-page">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1>Privacy Policy</h1>
          <p>
            This page will explain how Oma Synergies Travels And Tours Ltd collects, uses, and protects your personal
            data, including passports, academic transcripts, financial statements, and any information submitted
            through our forms or client portal.
          </p>
          <div className="notice">
            <strong>Coming Soon</strong>
            This policy is being finalized alongside legal review of our Terms & Conditions. In the meantime, please
            note: any personal data you provide is used strictly for the purpose of your application and is not shared
            with unauthorized third parties, as stated in our Terms & Conditions.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
