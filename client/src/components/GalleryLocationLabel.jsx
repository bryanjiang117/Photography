/**
 * Renders a gallery location string, bolding bilingual ` / ` separators.
 * @param {{ location: string }} props
 */
export default function GalleryLocationLabel({ location }) {
  const parts = location.split(" / ");
  if (parts.length === 1) return location;

  return parts.map((part, i) => (
    <span key={`${i}-${part}`}>
      {i > 0 ? <span className="font-bold"> / </span> : null}
      {part}
    </span>
  ));
}
