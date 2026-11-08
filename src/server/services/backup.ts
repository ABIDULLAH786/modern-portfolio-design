import "server-only";
import mongoose from "mongoose";
import { BACKUP_VERSION, type Backup } from "@/lib/validation/backup";
import { adminCustomThemes, adminExperiences, adminGames, adminProfile, adminServices, adminSettings, adminSkills, adminTestimonials } from "@/server/queries/admin";
import { CustomTheme, Experience, Game, Profile, Service, Settings, Skill, SkillCategory, Testimonial } from "@/server/models";

const strip = <T extends { id: string }>({ id, ...rest }: T) => ({ _id: id, ...rest });

export async function buildBackup(): Promise<Backup> {
  const [settings, profile, games, skills, experiences, services, testimonials, customThemes] = await Promise.all([
    adminSettings(),
    adminProfile(),
    adminGames(),
    adminSkills(),
    adminExperiences(),
    adminServices(),
    adminTestimonials(),
    adminCustomThemes(),
  ]);
  const { updatedAt: _pu, ...profileRest } = profile;
  void _pu;
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: { theme: settings.theme, sections: settings.sections, copy: settings.copy, display: settings.display, seo: settings.seo },
    profile: profileRest,
    games: games.map(({ updatedAt: _u, ...g }) => (void _u, g)),
    skillCategories: skills.categories,
    skills: skills.skills,
    experiences,
    services,
    testimonials,
    customThemes,
  };
}

/** Replaces all content with the backup inside a transaction (falls back to sequential writes on standalone MongoDB). */
export async function restoreBackup(b: Backup): Promise<void> {
  const write = async (session?: mongoose.ClientSession) => {
    const o = session ? { session } : {};
    await Settings.updateOne({ _id: "site" }, { $set: { ...b.settings, themeDraft: null } }, { ...o, upsert: true });
    await Profile.updateOne({ _id: "profile" }, { $set: { ...b.profile, cv: b.profile.cv ? { ...b.profile.cv, uploadedAt: b.profile.cv.uploadedAt ? new Date(b.profile.cv.uploadedAt) : null } : null } }, { ...o, upsert: true });
    const pairs: Array<[mongoose.Model<never>, Array<{ id: string }>]> = [
      [Game as unknown as mongoose.Model<never>, b.games],
      [SkillCategory as unknown as mongoose.Model<never>, b.skillCategories],
      [Skill as unknown as mongoose.Model<never>, b.skills],
      [Experience as unknown as mongoose.Model<never>, b.experiences],
      [Service as unknown as mongoose.Model<never>, b.services],
      [Testimonial as unknown as mongoose.Model<never>, b.testimonials],
      [CustomTheme as unknown as mongoose.Model<never>, b.customThemes],
    ];
    for (const [model, rows] of pairs) {
      await model.deleteMany({}, o);
      if (rows.length) await model.insertMany(rows.map(strip) as never[], o);
    }
  };

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(() => write(session));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/Transaction numbers are only allowed|replica set|IllegalOperation/i.test(msg)) await write();
    else throw e;
  } finally {
    await session.endSession();
  }
}
