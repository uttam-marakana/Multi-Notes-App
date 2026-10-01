import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Noteflow";
const DEFAULT_DESCRIPTION =
  "Noteflow is a modern notes workspace for organizing boards, rich-text notes, attachments, and protected content.";
const APP_URL = (import.meta.env.VITE_APP_URL || "").replace(/\/$/, "");

const pageMetadata = {
  "/": {
    title: "Noteflow — Organize your ideas in one place",
    description: DEFAULT_DESCRIPTION,
    index: true,
  },
  "/login": {
    title: "Sign in | Noteflow",
    description: "Sign in to your Noteflow workspace.",
    index: false,
  },
  "/signup": {
    title: "Create your account | Noteflow",
    description: "Create a Noteflow account and start organizing your notes.",
    index: false,
  },
  "/forgot-password": {
    title: "Reset your password | Noteflow",
    description: "Reset your Noteflow account password.",
    index: false,
  },
  "/boards": {
    title: "Boards | Noteflow",
    description: "Manage and organize your Noteflow boards.",
    index: false,
  },
  "/notes": {
    title: "Notes | Noteflow",
    description: "Manage your rich-text notes in Noteflow.",
    index: false,
  },
  "/trash/boards": {
    title: "Board Trash | Noteflow",
    description: "Review recently removed boards in Noteflow.",
    index: false,
  },
  "/trash/notes": {
    title: "Note Trash | Noteflow",
    description: "Review recently removed notes in Noteflow.",
    index: false,
  },
};

function ensureMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function ensureProperty(property, content) {
  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function ensureCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setStructuredData(metadata, canonical) {
  const id = "noteflow-structured-data";
  let script = document.getElementById(id);

  if (!metadata.index) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: canonical,
    description: metadata.description,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
  });
}

function resolveMetadata(pathname) {
  if (pathname.startsWith("/boards/edit/")) {
    return {
      title: "Edit Board | Noteflow",
      description: "Edit a Noteflow board.",
      index: false,
    };
  }

  if (pathname.startsWith("/boards/add")) {
    return {
      title: "Create Board | Noteflow",
      description: "Create a new board in Noteflow.",
      index: false,
    };
  }

  if (pathname.startsWith("/notes/add")) {
    return {
      title: "Create Note | Noteflow",
      description: "Create a rich-text note in Noteflow.",
      index: false,
    };
  }

  if (pathname.startsWith("/notes/edit/")) {
    return {
      title: "Edit Note | Noteflow",
      description: "Edit a rich-text note in Noteflow.",
      index: false,
    };
  }

  if (pathname.startsWith("/notes/details/")) {
    return {
      title: "Note Details | Noteflow",
      description: "View a note in Noteflow.",
      index: false,
    };
  }

  return pageMetadata[pathname] || {
    title: `Not Found | ${SITE_NAME}`,
    description: "The requested Noteflow page could not be found.",
    index: false,
  };
}

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = resolveMetadata(pathname);
    const canonical = `${APP_URL || window.location.origin}${pathname === "/dashboard" ? "/" : pathname}`;
    const robots = metadata.index
      ? "index, follow, max-image-preview:large"
      : "noindex, nofollow, noarchive";

    document.title = metadata.title;
    ensureMeta("description", metadata.description);
    ensureMeta("robots", robots);
    ensureMeta("theme-color", "#0b1020");

    ensureProperty("og:type", "website");
    ensureProperty("og:site_name", SITE_NAME);
    ensureProperty("og:title", metadata.title);
    ensureProperty("og:description", metadata.description);
    ensureProperty("og:url", canonical);

    ensureMeta("twitter:card", "summary");
    ensureMeta("twitter:title", metadata.title);
    ensureMeta("twitter:description", metadata.description);

    ensureCanonical(canonical);
    setStructuredData(metadata, canonical);
  }, [pathname]);

  return null;
}
