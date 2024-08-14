export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/rooms/session/:roomid*", "/rooms/end", "/rooms/session"],
};
