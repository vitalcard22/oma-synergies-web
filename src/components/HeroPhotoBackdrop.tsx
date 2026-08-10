import './HeroPhotoBackdrop.css';

interface Props {
  image: string;
}

/**
 * Stationary photo backdrop for the mobile hero.
 * Visibility is handled entirely in CSS (hidden at >=901px) rather than a JS
 * media-query gate — fewer moving parts, and no risk of a timing/hydration
 * issue leaving it unrendered on mobile.
 */
export default function HeroPhotoBackdrop({ image }: Props) {
  return (
    <div className="hero-photo-backdrop" aria-hidden="true">
      <div className="hpb-slide" style={{ backgroundImage: `url(${image})` }} />
      <div className="hpb-veil" />
    </div>
  );
}
