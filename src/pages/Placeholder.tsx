import Header from '../components/Header';
import Footer from '../components/Footer';

interface Props {
  title: string;
  note: string;
}

export default function Placeholder({ title, note }: Props) {
  return (
    <>
      <Header />
      <section style={{ paddingTop: 160, minHeight: '50vh' }}>
        <div className="wrap">
          <span className="eyebrow">Coming Soon</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.6vw, 42px)', marginTop: 16 }}>{title}</h1>
          <p style={{ color: 'var(--slate)', marginTop: 16, maxWidth: 560 }}>{note}</p>
        </div>
      </section>
      <Footer />
    </>
  );
}
