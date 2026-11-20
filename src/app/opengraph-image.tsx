import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { SHARE_IMAGE_SIZE, shareImage } from "@/lib/shareImage";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return shareImage({ title: "Portfolio", heading: SITE_NAME, subtitle: SITE_TAGLINE });
}
