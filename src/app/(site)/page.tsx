import type { Metadata } from "next";
import { HomeSections } from "@/components/sections/home-sections";
import { JsonLd } from "@/components/site/json-ld";
import { personJsonLd } from "@/lib/seo";
import {
  getExperiences,
  getProfile,
  getPublishedGames,
  getPublishedTestimonials,
  getServices,
  getSettings,
  getSkillGroups,
} from "@/server/queries/public";

export const revalidate = 86400;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, profile, games, groups, experiences, services, testimonials] = await Promise.all([
    getSettings(),
    getProfile(),
    getPublishedGames(),
    getSkillGroups(),
    getExperiences(),
    getServices(),
    getPublishedTestimonials(),
  ]);
  return (
    <>
      <JsonLd data={personJsonLd(profile, settings)} />
      <HomeSections settings={settings} profile={profile} games={games} groups={groups} experiences={experiences} services={services} testimonials={testimonials} />
    </>
  );
}
