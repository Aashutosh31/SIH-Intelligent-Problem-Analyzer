import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  UserRound,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Code,
} from "lucide-react";

import {
  fetchTeamProfile,
  saveTeamProfile,
} from "../../services/teamProfileService";

import { getTeamId } from "../../utils/teamIdentity";

import { DEFAULT_TEAM_PROFILE } from "../../types/team";

const SESSION_EXPIRED_MESSAGE =
  "Your team session is no longer authorized. Please recreate or reconnect the team profile.";

const createMemberId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `member-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createDefaultMember = () => ({
  id: createMemberId(),
  name: "",
  role: "",
  skills: [],
});

const normalizeSkill = (skill) => {
  if (typeof skill === "string") {
    return {
      name: skill.trim(),
      proficiency: 5,
    };
  }

  if (!skill || typeof skill !== "object") {
    return null;
  }

  const name = typeof skill.name === "string" ? skill.name.trim() : "";

  if (!name) {
    return null;
  }

  const numericProficiency = Number(skill.proficiency);

  return {
    name,
    proficiency: Number.isFinite(numericProficiency)
      ? Math.max(1, Math.min(10, Math.round(numericProficiency)))
      : 5,
  };
};

const normalizeProfile = (profile) => {
  return {
    ...DEFAULT_TEAM_PROFILE,
    ...profile,
    members:
      Array.isArray(profile?.members) && profile.members.length > 0
        ? profile.members.map((member) => ({
            id: member.id || createMemberId(),
            name: member.name || "",
            role: member.role || "",
            skills: Array.isArray(member.skills)
              ? member.skills.map(normalizeSkill).filter(Boolean)
              : [],
          }))
        : [createDefaultMember()],
    preferences: {
      ...DEFAULT_TEAM_PROFILE.preferences,
      ...(profile?.preferences || {}),
    },
  };
};

export default function TeamProfileForm({ onSaved, onCancel }) {
  const [profile, setProfile] = useState(
    normalizeProfile(DEFAULT_TEAM_PROFILE),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [skillDrafts, setSkillDrafts] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      const teamId = getTeamId();

      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        const existingProfile = await fetchTeamProfile(teamId);

        setProfile(
          normalizeProfile({
            ...existingProfile,
            teamId,
          }),
        );
      } catch (loadError) {
        if (
          loadError instanceof Error &&
          loadError.message === "Team profile not found."
        ) {
          setProfile(
            normalizeProfile({
              ...DEFAULT_TEAM_PROFILE,
              teamId,
            }),
          );
        } else if (
          loadError instanceof Error &&
          (loadError.status === 401 || loadError.status === 403)
        ) {
          console.error(
            "Team session is not authorized:",
            loadError,
          );

          setError(SESSION_EXPIRED_MESSAGE);

          setProfile(
            normalizeProfile({
              ...DEFAULT_TEAM_PROFILE,
              teamId,
            }),
          );
        } else {
          console.error("Failed to load team profile:", loadError);

          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load team profile.",
          );

          setProfile(
            normalizeProfile({
              ...DEFAULT_TEAM_PROFILE,
              teamId,
            }),
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = (updates) => {
    setProfile((current) => ({
      ...current,
      ...updates,
    }));
  };

  const updatePreference = (key, value) => {
    setProfile((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: value,
      },
    }));
  };

  const updateMember = (memberId, updates) => {
    setProfile((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              ...updates,
            }
          : member,
      ),
    }));
  };

  const addMember = () => {
    setProfile((current) => ({
      ...current,
      members: [...current.members, createDefaultMember()],
    }));
  };

  const removeMember = (memberId) => {
    setProfile((current) => {
      if (current.members.length === 1) {
        return current;
      }

      return {
        ...current,
        members: current.members.filter((member) => member.id !== memberId),
      };
    });
  };

  const setSkillDraft = (memberId, value) => {
    setSkillDrafts((current) => ({
      ...current,
      [memberId]: value,
    }));
  };

  const addSkill = (memberId) => {
    const draft = (skillDrafts[memberId] || "").trim();

    if (!draft) {
      return;
    }

    const member = profile.members.find((item) => item.id === memberId);

    if (!member) {
      return;
    }

    const existingSkills = member.skills || [];

    const alreadyExists = existingSkills.some(
      (skill) => skill.name.toLowerCase() === draft.toLowerCase(),
    );

    if (alreadyExists) {
      setSkillDraft(memberId, "");
      return;
    }

    updateMember(memberId, {
      skills: [
        ...existingSkills,
        {
          name: draft,
          proficiency: 5,
        },
      ],
    });

    setSkillDraft(memberId, "");
  };

  const removeSkill = (memberId, skillToRemove) => {
    const member = profile.members.find((item) => item.id === memberId);

    if (!member) {
      return;
    }

    updateMember(memberId, {
      skills: member.skills.filter((skill) => skill.name !== skillToRemove),
    });
  };

  const updateSkillProficiency = (memberId, skillName, proficiency) => {
    updateMember(memberId, {
      skills:
        profile.members
          .find((member) => member.id === memberId)
          ?.skills.map((skill) =>
            skill.name === skillName
              ? {
                  ...skill,
                  proficiency: Math.max(1, Math.min(10, Number(proficiency))),
                }
              : skill,
          ) || [],
    });
  };

  const removeLastSkill = (memberId) => {
    const draft = skillDrafts[memberId] || "";

    if (draft.length > 0) {
      return;
    }

    const member = profile.members.find((item) => item.id === memberId);

    if (!member || member.skills.length === 0) {
      return;
    }

    updateMember(memberId, {
      skills: member.skills.slice(0, member.skills.length - 1),
    });
  };

  const handleSkillKeyDown = (event, memberId) => {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault();
      addSkill(memberId);
      return;
    }

    if (event.key === "Backspace") {
      const draft = skillDrafts[memberId] || "";

      if (!draft) {
        event.preventDefault();
        removeLastSkill(memberId);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const teamName = profile.name.trim();

    if (!teamName) {
      setError("Please enter a team name.");
      return;
    }

    const incompleteMember = profile.members.find(
      (member) => !member.name.trim() || !member.role.trim(),
    );

    if (incompleteMember) {
      setError("Every team member needs a name and role.");
      return;
    }

    const teamId = getTeamId();

    setIsSaving(true);

    try {
      const payload = {
        ...profile,
        teamId,
        name: teamName,
        members: profile.members.map((member) => ({
          name: member.name.trim(),
          role: member.role.trim(),
          skills: member.skills,
        })),
      };

      const savedProfile = await saveTeamProfile(payload);

      setProfile(
        normalizeProfile({
          ...savedProfile,
          teamId,
        }),
      );

      setSuccessMessage("Team profile saved successfully.");

      if (onSaved) {
        onSaved(savedProfile);
      }
    } catch (saveError) {
      console.error("Failed to save team profile:", saveError);

      setError(
        saveError instanceof Error &&
          (saveError.status === 401 || saveError.status === 403)
          ? SESSION_EXPIRED_MESSAGE
          : saveError instanceof Error
            ? saveError.message
            : "Failed to save team profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl min-h-90">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <p className="text-sm text-zinc-500 font-mono">Loading terminal profile...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)]"></div>

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserRound size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Team Profile</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white">Define Your Squad</h2>

          <p className="text-sm text-zinc-500 mt-1">
            This information will later be used to calculate personalized team-fit scores.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-zinc-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="p-8 space-y-10 relative z-10">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-medium text-red-200">Unable to save profile</p>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* Team name */}
        <section>
          <label
            htmlFor="team-name"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Team name
          </label>

          <input
            id="team-name"
            type="text"
            value={profile.name}
            onChange={(event) =>
              updateProfile({
                name: event.target.value,
              })
            }
            placeholder="e.g. Team Syntax Error"
            maxLength={100}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          />
        </section>

        {/* Members */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <div>
              <h3 className="text-sm font-medium text-white">Team members</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Add the people who will actually build the SIH solution.
              </p>
            </div>

            <button
              type="button"
              onClick={addMember}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          <div className="space-y-4">
            {profile.members.map((member, index) => (
              <div
                key={member.id}
                className="border border-white/5 bg-black/40 rounded-2xl p-5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Member {index + 1}
                  </span>

                  {profile.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Remove member ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor={`member-name-${member.id}`}
                      className="block text-xs font-medium text-zinc-500 mb-2"
                    >
                      Name
                    </label>

                    <input
                      id={`member-name-${member.id}`}
                      type="text"
                      value={member.name}
                      onChange={(event) =>
                        updateMember(member.id, {
                          name: event.target.value,
                        })
                      }
                      placeholder="Member name"
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`member-role-${member.id}`}
                      className="block text-xs font-medium text-zinc-500 mb-2"
                    >
                      Primary role
                    </label>

                    <input
                      id={`member-role-${member.id}`}
                      type="text"
                      value={member.role}
                      onChange={(event) =>
                        updateMember(member.id, {
                          role: event.target.value,
                        })
                      }
                      placeholder="e.g. Backend / AI Engineer"
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`member-skills-${member.id}`}
                    className="block text-xs font-medium text-zinc-500 mb-3"
                  >
                    Skills
                  </label>

                  <div className="space-y-3">
                    {member.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex flex-col bg-zinc-900/50 border border-white/5 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-mono text-blue-300">
                            {skill.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeSkill(member.id, skill.name)}
                            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                            aria-label={`Remove ${skill.name}`}
                          >
                            Remove
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label
                              htmlFor={`proficiency-${member.id}-${skill.name}`}
                              className="text-xs text-zinc-500"
                            >
                              Proficiency
                            </label>

                            <span className="text-xs font-mono text-blue-400">
                              {skill.proficiency}/10
                            </span>
                          </div>

                          <input
                            id={`proficiency-${member.id}-${skill.name}`}
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={skill.proficiency}
                            onChange={(event) =>
                              updateSkillProficiency(
                                member.id,
                                skill.name,
                                event.target.value,
                              )
                            }
                            className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
                          />

                          <div className="flex justify-between mt-1 text-[10px] text-zinc-600">
                            <span>Beginner</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-black border border-white/10 rounded-lg px-3 py-2 flex items-center focus-within:border-blue-500 transition-colors min-h-[46px]">
                      <Code size={14} className="text-zinc-600 mr-2" />

                      <input
                        id={`member-skills-${member.id}`}
                        type="text"
                        value={skillDrafts[member.id] || ""}
                        onChange={(event) =>
                          setSkillDraft(
                            member.id,
                            event.target.value.replace(/,/g, ""),
                          )
                        }
                        onKeyDown={(event) =>
                          handleSkillKeyDown(event, member.id)
                        }
                        placeholder="Type a skill and press Enter or comma"
                        className="w-full bg-transparent border-0 outline-none text-xs font-mono text-white placeholder:text-zinc-700"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 mt-2">
                    Add skills with Enter or comma, then set each skill's
                    proficiency from 1 to 10.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <SlidersHorizontal size={14} className="text-zinc-400" />

            <h3 className="text-sm font-medium text-white">Team preferences</h3>
          </div>

          <div className="space-y-6 bg-black/40 border border-white/5 p-5 rounded-2xl">
            {/* Software only */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={profile.preferences.softwareOnly}
                onChange={(event) =>
                  updatePreference("softwareOnly", event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded bg-black border-white/10 text-blue-600 focus:ring-0 accent-blue-500"
              />

              <span>
                <span className="block text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                  Prefer software-only problems
                </span>

                <span className="block text-xs text-zinc-500 mt-1">
                  We'll eventually use this when ranking hardware-dependent SIH
                  problems.
                </span>
              </span>
            </label>

            {/* Hardware */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Hardware comfort</span>
                <span className="text-xs font-mono text-blue-400">
                  {profile.preferences.hardwareComfort}/10
                </span>
              </div>

              <input
                id="hardware-comfort"
                type="range"
                min="0"
                max="10"
                step="1"
                value={profile.preferences.hardwareComfort}
                onChange={(event) =>
                  updatePreference(
                    "hardwareComfort",
                    Number(event.target.value),
                  )
                }
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
              />
            </div>

            {/* AI/ML */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">AI / ML comfort</span>
                <span className="text-xs font-mono text-blue-400">
                  {profile.preferences.aiMlComfort}/10
                </span>
              </div>

              <input
                id="ai-ml-comfort"
                type="range"
                min="0"
                max="10"
                step="1"
                value={profile.preferences.aiMlComfort}
                onChange={(event) =>
                  updatePreference("aiMlComfort", Number(event.target.value))
                }
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Willingness to learn */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Willingness to learn new technologies</span>
                <span className="text-xs font-mono text-blue-400">
                  {profile.preferences.willingnessToLearn}/10
                </span>
              </div>

              <input
                id="willingness-to-learn"
                type="range"
                min="0"
                max="10"
                step="1"
                value={profile.preferences.willingnessToLearn}
                onChange={(event) =>
                  updatePreference(
                    "willingnessToLearn",
                    Number(event.target.value),
                  )
                }
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-white/5 bg-black/50 flex justify-end gap-4 relative z-10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="text-sm font-medium text-zinc-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Team Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}