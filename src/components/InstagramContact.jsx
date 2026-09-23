import instagramIcon from "../assets/images/instagram-icon.png";

function InstagramContact() {
  return (
    <div className="instagram-contact">
      <a
        href="https://www.instagram.com/parfum_tournee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
        target="_blank"
        rel="noreferrer"
      >
        <img src={instagramIcon} alt="Instagram" className="instagram-icon" />
      </a>

      <p>若有任何購買問題，可以透過 IG 與我們聯繫</p>
    </div>
  );
}

export default InstagramContact;
