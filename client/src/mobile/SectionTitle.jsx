const SectionTitle = ({ english, chinese }) => {
  return (
    <div>
      <div className="text-4xl font-medium tracking-tighter leading-none bodoni-small">
        {english}
      </div>
      <div className="translate-x-1 text-base font-sh font-semibold tracking-widest">
        {chinese}
      </div>
    </div>
  );
};

export default SectionTitle;
