import { INTRO } from "../constants/data";

const IntroNameLetters = ({ className }) => (
  <div className={className} lang="zh-CN" translate="no">
    {INTRO.nameChars.map(({ zh, pinyin }) => (
      <span key={zh} className="intro-name-letter relative inline-block">
        {zh}
        <span
          className="intro-name-pinyin pointer-events-none absolute top-0 left-full z-10 pt-6 -translate-x-2"
          aria-hidden="true"
        >
          {pinyin}
        </span>
      </span>
    ))}
  </div>
);

export default IntroNameLetters;
