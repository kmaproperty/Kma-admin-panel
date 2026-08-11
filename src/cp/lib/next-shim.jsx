// Shim for the Next.js APIs used by the seller-postProperty module.
// All exports are drop-in replacements that use react-router-dom + plain HTML
// so the seller code can compile inside this Vite/React admin panel.

import * as RR from "react-router-dom";

// ---- next/image ---------------------------------------------------------
// In Next.js, importing an SVG/PNG returns `StaticImageData` (object with .src).
// In Vite with vite-plugin-svgr + exportAsDefault:true, importing an SVG returns
// a React component. Handle both shapes plus plain string URLs.
export const Image = ({ src, alt, width, height, className, style, priority, ...rest }) => {
  const isReactComp =
    typeof src === "function" ||
    (src && typeof src === "object" && (src.$$typeof || src.render));
  if (isReactComp) {
    const Comp = src;
    return (
      <Comp
        width={width}
        height={height}
        className={className}
        style={style}
        aria-label={alt ?? ""}
      />
    );
  }
  const realSrc =
    typeof src === "string" ? src : src?.src ?? src?.default ?? src;
  return (
    <img
      src={realSrc}
      alt={alt ?? ""}
      width={width}
      height={height}
      className={className}
      style={style}
      {...rest}
    />
  );
};
export default Image;

// ---- next/link ----------------------------------------------------------
export const NextLinkShim = ({ href, children, replace, scroll, prefetch, ...rest }) => (
  <RR.Link to={href ?? "#"} replace={replace} {...rest}>{children}</RR.Link>
);

// ---- next/navigation hooks ---------------------------------------------
export const useParams = RR.useParams;

// Next's useSearchParams returns a read-only ReadonlyURLSearchParams.
// react-router's returns [params, setParams]. Wrap so seller usage of
// `searchParams.get("...")` keeps working.
export const useSearchParams = () => {
  const [params] = RR.useSearchParams();
  return params;
};

// Map seller-frontend URLs (used in copied seller code) to the admin's URL
// scheme. The seller code calls things like router.push("/post-property/<id>")
// after Step 1; in the admin those routes don't exist, so we rewrite them.
const remapSellerPath = (path) => {
  if (typeof path !== "string") return path;
  // /post-property/<id>?... → /add-kma-property/<id>?...
  if (path.startsWith("/post-property/")) {
    return "/add-kma-property/" + path.slice("/post-property/".length);
  }
  if (path === "/post-property" || path.startsWith("/post-property?")) {
    return "/add-kma-property" + path.slice("/post-property".length);
  }
  // After publish: /my-listing?propertyId=<id> → /kma-properties
  if (path.startsWith("/my-listing")) {
    return "/kma-properties";
  }
  // The KMA Internal CP is always KYC-complete, so any KYC redirect is a no-op
  // for us — keep them on the current page rather than bouncing to a dead URL.
  if (path.startsWith("/kyc") || path.startsWith("/user-dashboard")) {
    return null; // signal "do nothing"
  }
  return path;
};

export const useRouter = () => {
  const navigate = RR.useNavigate();
  const location = RR.useLocation();
  return {
    push: (path) => {
      const target = remapSellerPath(path);
      if (target == null) return;
      navigate(target);
    },
    replace: (path) => {
      const target = remapSellerPath(path);
      if (target == null) return;
      navigate(target, { replace: true });
    },
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
    // some seller code reads .pathname / .asPath
    pathname: location.pathname,
    asPath: location.pathname + location.search,
  };
};

export const usePathname = () => RR.useLocation().pathname;

// ---- next/dynamic -------------------------------------------------------
// Minimal stand-in: returns the imported module's default synchronously
// via React.lazy + Suspense fallback. Most seller usages just disable SSR.
import { lazy, Suspense } from "react";
export const dynamic = (importer, opts = {}) => {
  const Lazy = lazy(importer);
  const Wrapped = (props) => (
    <Suspense fallback={opts.loading ? opts.loading() : null}>
      <Lazy {...props} />
    </Suspense>
  );
  Wrapped.displayName = "DynamicShim";
  return Wrapped;
};
