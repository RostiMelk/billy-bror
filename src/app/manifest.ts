import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Billy Bror",
    short_name: "Billy Bror",
    description: "A poop tracker for the modern age",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
