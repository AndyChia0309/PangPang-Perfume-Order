import InstagramIcon from "./icons/InstagramIcon";

function InstagramContact() {
  return (
    <a
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors duration-200 hover:bg-brand-dark"
      href="https://www.instagram.com/parfum_tournee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
      target="_blank"
      rel="noreferrer"
      aria-label="透過 Instagram 聯繫香水夢遊"
      title="若有任何問題都歡迎 IG 聯繫我們"
    >
      <InstagramIcon className="size-5" aria-hidden="true" />
    </a>
  );
}

export default InstagramContact;
