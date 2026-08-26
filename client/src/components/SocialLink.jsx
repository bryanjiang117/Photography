const SocialLink = ({ name, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link relative inline-block no-underline text-inherit cursor-pointer"
    >
      <span className="social-link-mark" aria-hidden="true" />
      {name}
    </a>
  );
};

export default SocialLink;
