import { z } from "zod";
import { COVER_STYLES, GAME_STATUSES, LINK_KINDS, MAX_GALLERY, MAX_TAGS } from "@/lib/constants";
import { httpUrl, mediaRef, required, slug, text, youtubeUrl } from "./primitives";

export const gameLinkSchema = z.object({
  kind: z.enum(LINK_KINDS),
  url: httpUrl,
  label: text(40, "Label"),
});

export const gameSchema = z.object({
  title: required(80, "Title"),
  slug,
  status: z.enum(GAME_STATUSES),
  published: z.boolean(),
  featured: z.boolean(),
  genre: required(40, "Genre"),
  platforms: z.array(required(30, "Platform")).max(10),
  engine: text(40, "Engine"),
  releaseYear: z.number().int().min(1990).max(2100).nullable(),
  shortDescription: required(220, "Short description"),
  description: text(10000, "Description"),
  tags: z.array(required(30, "Tag")).max(MAX_TAGS, `At most ${MAX_TAGS} tags`),
  cover: mediaRef,
  coverStyle: z.enum(COVER_STYLES),
  gallery: z.array(mediaRef.unwrap()).max(MAX_GALLERY, `At most ${MAX_GALLERY} screenshots`),
  trailerUrl: youtubeUrl,
  links: z.array(gameLinkSchema).max(8),
});
export type GameInput = z.infer<typeof gameSchema>;
