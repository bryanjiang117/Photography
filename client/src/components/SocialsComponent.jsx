import { SOCIALS as socials } from "../constants/data";
import SocialLink from "./SocialLink";

const SocialsPanel = () => {
  return (
    <div className="relative flex flex-col justify-center items-center gap-2 py-10 px-30 h-full text-md text-center">
      {socials.map((social) => (
        <div key={social.name}>
          <SocialLink name={social.name} href={social.link} />
        </div>
      ))}
    </div>
  );
};

export default SocialsPanel;
