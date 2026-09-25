import brandLogo from "../assets/images/logo.svg";
import InstagramContact from "./InstagramContact";

function SiteHeader() {
  return (
    <header className="page-gutter grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4">
      <img
        className="h-8 w-auto justify-self-start lg:h-10 2xl:h-12"
        src={brandLogo}
        alt="香水夢遊 Parfum Tournée"
        width={256}
        height={226}
      />
      <p className="rounded-full bg-brand-soft px-3 py-1 text-center text-caption text-brand">
        目前為作品集展示使用
      </p>
      <div className="justify-self-end">
        <InstagramContact />
      </div>
    </header>
  );
}

export default SiteHeader;
