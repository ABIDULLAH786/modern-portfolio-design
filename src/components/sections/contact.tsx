import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { CopyButton } from "@/components/site/copy-button";
import { GradientHeading } from "@/components/site/gradient-heading";
import type { ProfileDTO, SettingsDTO } from "@/lib/types";

export function Contact({ profile, copy, turnstileSiteKey }: { profile: ProfileDTO; copy: SettingsDTO["copy"]["contact"]; turnstileSiteKey?: string }) {
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="card contact-wrap reveal">
          <div className="glow glow-primary" style={{ width: 380, height: 380, top: -140, right: -100, opacity: 0.25 }} aria-hidden="true" />
          <div className="contact-intro" style={{ position: "relative", zIndex: 1 }}>
            {copy.eyebrow ? <span className="eyebrow">{copy.eyebrow}</span> : null}
            <GradientHeading text={copy.title} id="contact-title" />
            {copy.subtitle ? <p>{copy.subtitle}</p> : null}
            <div className="c-list">
              {profile.email ? (
                <div className="c-item">
                  <div className="svc-ico">
                    <Mail aria-hidden="true" />
                  </div>
                  <div className="c-body">
                    <small>Email</small>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </div>
                  <CopyButton text={profile.email} label="Copy email address" done="Email copied" />
                </div>
              ) : null}
              {profile.phone ? (
                <div className="c-item">
                  <div className="svc-ico">
                    <Phone aria-hidden="true" />
                  </div>
                  <div className="c-body">
                    <small>Phone</small>
                    <a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}>{profile.phone}</a>
                  </div>
                </div>
              ) : null}
              {profile.location ? (
                <div className="c-item">
                  <div className="svc-ico">
                    <MapPin aria-hidden="true" />
                  </div>
                  <div className="c-body">
                    <small>Based in</small>
                    {profile.location}
                  </div>
                </div>
              ) : null}
              {profile.availabilityText ? (
                <div className="c-item">
                  <div className="svc-ico">
                    <Clock aria-hidden="true" />
                  </div>
                  <div className="c-body">
                    <small>Availability</small>
                    {profile.availabilityText}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <ContactForm
            projectTypes={copy.projectTypes}
            budgetOptions={copy.budgetEnabled ? copy.budgetOptions : []}
            fallbackEmail={profile.email}
            {...(turnstileSiteKey ? { turnstileSiteKey } : {})}
          />
        </div>
      </div>
    </section>
  );
}
