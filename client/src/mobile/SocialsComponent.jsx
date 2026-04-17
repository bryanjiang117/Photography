import { SOCIALS } from "../constants/data";

const SocialsComponent = () => {
  return (
    <div className="flex flex-col px-6 py-8 w-full">
      <span className="bg-primary-light px-2 w-fit text-md">see more</span>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-md">
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
