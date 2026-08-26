import { SOCIALS } from "../constants/data";

const SocialsComponent = () => {
  return (
    <div className="flex flex-col px-6 py-4 w-full">
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
        {SOCIALS.map((social) => (
          <a key={social.name} href={social.link} target="_blank">
            {social.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialsComponent;
