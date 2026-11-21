import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const isDashboardPath = (pathname: string) =>
  pathname === "/dashboard" || pathname.startsWith("/dashboard/");

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") &&
    process.env.CLERK_SECRET_KEY
);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isDashboardPath(req.nextUrl.pathname)) {
    await auth.protect();
  }
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (!hasClerkKeys) {
    if (isDashboardPath(req.nextUrl.pathname)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
