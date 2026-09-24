import instagramIcon from "../assets/images/instagram-icon.png";

function InstagramContact() {
  return (
    <a
      className="flex items-center gap-2 text-caption text-ink-muted transition-colors duration-200 hover:text-brand"
      href="https://www.instagram.com/parfum_tournee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
      target="_blank"
      rel="noreferrer"
    >
      若有任何問題都歡迎 IG 聯繫我們
      <img src={instagramIcon} alt="" className="size-[30px] shrink-0" />
    </a>
  );
}

export default InstagramContact;
