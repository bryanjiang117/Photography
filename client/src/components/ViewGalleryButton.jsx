const ViewGalleryButton = ({ onClick, vertical = false, className = "" }) => {
  return (
    <button
      type="button"
      className={`social-link relative w-fit cursor-pointer select-none bg-transparent border-0 p-0 text-left text-inherit bodoni-small text-sm uppercase tracking-widest whitespace-nowrap opacity-80 leading-none${
        vertical ? " social-link-vertical [writing-mode:vertical-rl]" : ""
      }${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      <span className="social-link-mark" aria-hidden="true" />
      VIEW GALLERY
    </button>
  );
};

export default ViewGalleryButton;
