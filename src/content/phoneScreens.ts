/**
 * The app screen inside each store-listing capture in public/mobile/ (780 x 1689 files), measured from the files.
 * `box` starts under the status bar or the notch and stays inside the glass, so no bezel of the listing's own phone shows.
 * A listing whose phone runs off the bottom of the image has a shorter box than a whole screen: `fill` is the app's
 * own colour under it. `top` is the colour of the status bar that the frame draws above the box.
 */

export interface Px {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PhoneScreen {
  width: number;
  height: number;
  box: Px;
  top: string;
  fill: string;
}

const LISTING = { width: 780, height: 1689 };
const grocery = { ...LISTING, box: { x: 88, y: 371, w: 604, h: 1227 }, top: "#efefef", fill: "#efefef" };
const bookstore = { ...LISTING, box: { x: 108, y: 712, w: 564, h: 977 }, top: "#ffffff", fill: "#ffffff" };

export const phoneScreens: Record<string, PhoneScreen> = {
  "/mobile/grocery-1.webp": grocery,
  "/mobile/grocery-2.webp": { ...grocery, top: "#3a0a10" },
  "/mobile/grocery-3.webp": grocery,
  "/mobile/reading-1.webp": { ...LISTING, box: { x: 80, y: 532, w: 620, h: 1157 }, top: "#ffffff", fill: "#fefdf9" },
  "/mobile/reading-2.webp": { ...LISTING, box: { x: 80, y: 586, w: 620, h: 1103 }, top: "#ffffff", fill: "#fefefb" },
  "/mobile/bookstore-1.webp": bookstore,
  "/mobile/bookstore-2.webp": bookstore,
};
