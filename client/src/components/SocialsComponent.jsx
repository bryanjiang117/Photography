import { SOCIALS as socials } from "../constants/data";

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
    </div>
  );
};

export default SocialsPanel;
