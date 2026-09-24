import instagramIcon from "../assets/images/instagram-icon.png";

function InstagramContact() {
  return (
    <div className="flex items-center justify-center gap-2">
      <a
        href="https://www.instagram.com/parfum_tournee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
        target="_blank"
        rel="noreferrer"
      >
        <img src={instagramIcon} alt="Instagram" className="h-[30px] w-[30px]" />
      </a>

      <p className="text-caption text-ink-muted">若有任何購買問題，可以透過 IG 與我們聯繫</p>
    </div>
  );
}

export default InstagramContact;
