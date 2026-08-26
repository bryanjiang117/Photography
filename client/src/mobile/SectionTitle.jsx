const SectionTitle = ({ english, chinese }) => {
  return (
    <div className="w-full">
      <div className="text-4xl font-medium tracking-tighter leading-none bodoni-small">
        {english}
      </div>
      <div className="mt-0.5 text-right text-sm font-sh font-semibold tracking-widest">
        {chinese}
      </div>
    </div>
  );
};

export default SectionTitle;
