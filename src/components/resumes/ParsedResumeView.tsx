import { ParsedResume } from "@/types/resume";
import { Briefcase, GraduationCap, Code, FolderGit2, Mail, Phone, User, Trophy, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ParsedResumeViewProps {
  data?: ParsedResume;
}

export function ParsedResumeView({ data }: ParsedResumeViewProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 h-full">
        <p>No parsed data available for this resume.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-8 bg-zinc-950/80">
      {/* Header Info */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {data.name || "Unnamed Candidate"}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          {data.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              <span>{data.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Code className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <Badge key={index} variant="default" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Experience</h3>
          </div>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index} className="space-y-2 relative pl-4 before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-zinc-800">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-white">{exp.role}</h4>
                  <span className="text-xs text-zinc-500 whitespace-nowrap bg-zinc-900 px-2 py-1 rounded-md">{exp.duration}</span>
                </div>
                <p className="text-sm font-medium text-violet-400">{exp.company}</p>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="list-disc pl-5 text-sm text-zinc-400 mt-2 space-y-1">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <FolderGit2 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Projects</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.projects.map((proj, index) => (
              <div key={index} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-2">
                <h4 className="font-medium text-white">{proj.title}</h4>
                {proj.description && (
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <GraduationCap className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold">Education</h3>
          </div>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50">
                <div>
                  <h4 className="font-medium text-white">{edu.degree}</h4>
                  <p className="text-sm text-zinc-400">{edu.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold">Achievements</h3>
          </div>
          <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
            {data.achievements.map((ach, index) => (
              <li key={index}>{ach}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <Award className="h-5 w-5 text-teal-400" />
            <h3 className="text-lg font-semibold">Certifications</h3>
          </div>
          <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
            {data.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
