import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveAccess } from "@/lib/server/access-state";

const PUBLIC_PAGES = new Set(["/auth", "/acesso-negado", "/pagamento"]);
const PUBLIC_API_PREFIXES = [
  "/api/v1/health",
  "/api/v1/stripe/webhook",
  "/api/v1/kiwify/webhook",
];
const AUTHORIZED_WHITELIST = new Set(["/pagamento", "/acesso-negado"]);
const AUTHORIZED_API_WHITELIST = ["/api/v1/billing/checkout", "/api/v1/profile"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".ico")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const isPublicPage = PUBLIC_PAGES.has(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isApiRoute && isPublicApi) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (isPublicPage) {
      return NextResponse.next();
    }

    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_authorized, is_admin, billing_status")
    .eq("id", user.id)
    .maybeSingle();

  const { isAuthorized, isAdmin } = resolveAccess(profileData);

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (pathname === "/auth") {
    if (isAuthorized) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/acesso-negado", request.url));
  }

  if (!isAuthorized) {
    if (isApiRoute) {
      if (AUTHORIZED_API_WHITELIST.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
      }

      return NextResponse.json(
        { error: "Acesso restrito. Entre em contato para liberação." },
        { status: 403 },
      );
    }

    if (!AUTHORIZED_WHITELIST.has(pathname)) {
      return NextResponse.redirect(new URL("/pagamento", request.url));
    }
  } else if (AUTHORIZED_WHITELIST.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
