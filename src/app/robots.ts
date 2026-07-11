import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://careercopilot.ai";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: [
        "/dashboard",
        "/analyses",
        "/resumes",
        "/job-descriptions",
        "/new-analysis",
        "/settings",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
