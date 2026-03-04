const socials = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/bryanjiang117",
  },
  {
    name: "GitHub",
    link: "https://github.com/bryanjiang117",
  },
  {
    name: "Other Site",
    link: "https://www.bryan-jiang.com/",
  },
];

const SocialsPanel = () => {
  return (
    <div className="relative flex flex-col justify-center items-center gap-2 py-10 px-30 h-full text-md text-center">
      {socials.map((social) => (
        <div key={social.name}>
          <a href={social.link} target="_blank">
            {social.name}
          </a>
        </div>
      ))}
      <div className="absolute -right-6 bottom-4 flex items-center gap-2">
        <span className="bg-primary-light px-2">see more</span>
      </div>
    </div>
  );
};

export default SocialsPanel;
