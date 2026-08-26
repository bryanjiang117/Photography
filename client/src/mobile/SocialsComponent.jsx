import { SOCIALS } from "../constants/data";
import SocialLink from "../components/SocialLink";

const SocialsComponent = () => {
  return (
    <div className="flex flex-col px-6 py-4 w-full">
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
        {SOCIALS.map((social) => (
          <SocialLink key={social.name} name={social.name} href={social.link} />
        ))}
      </div>
    </div>
  );
};

export default SocialsComponent;
