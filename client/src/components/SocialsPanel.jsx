const socials = [
  {
    name: "GitHub",
    link: "https://github.com/bryanjiang117",
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/bryanjiang117",
  },
  {
    name: "Other Site",
    link: "https://www.bryan-jiang.com/",
  },
];

const SocialsPanel = () => {
  return (
    <div className="flex flex-col gap-2 p-8 text-md">
      {socials.map((social) => (
        <div key={social.name}>
          <a href={social.link} target="_blank">
            {social.name}
          </a>
        </div>
      ))}
    </div>
  );
};

export default SocialsPanel;
