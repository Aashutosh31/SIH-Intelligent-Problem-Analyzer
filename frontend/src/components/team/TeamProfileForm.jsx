import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  UserRound,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  fetchTeamProfile,
  saveTeamProfile,
} from "../../services/teamProfileService";

import { getTeamId } from "../../utils/teamIdentity";

import { DEFAULT_TEAM_PROFILE } from "../../types/team";

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
            skills: Array.isArray(member.skills) ? member.skills : [],
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
        // A 404 simply means this team does not have
        // a profile yet. Start with the default form.
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
      (skill) => skill.toLowerCase() === draft.toLowerCase(),
    );

    if (alreadyExists) {
      setSkillDraft(memberId, "");
      return;
    }

    updateMember(memberId, {
      skills: [...existingSkills, draft],
    });

    setSkillDraft(memberId, "");
  };

  const removeSkill = (memberId, skillToRemove) => {
    const member = profile.members.find((item) => item.id === memberId);

    if (!member) {
      return;
    }

    updateMember(memberId, {
      skills: member.skills.filter((skill) => skill !== skillToRemove),
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
        saveError instanceof Error
          ? saveError.message
          : "Failed to save team profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-90">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />

        <p className="text-sm text-slate-400">Loading team profile...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserRound size={18} className="text-blue-400" />

              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Team Profile
              </span>
            </div>

            <h2 className="text-xl font-semibold text-white">
              Tell us about your team
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              This information will later be used to calculate personalized
              team-fit scores.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/30 p-4">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-medium text-red-300">
                Unable to save profile
              </p>

              <p className="text-sm text-red-200/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-4">
            <p className="text-sm text-emerald-300">{successMessage}</p>
          </div>
        )}

        {/* Team name */}
        <section>
          <label
            htmlFor="team-name"
            className="block text-sm font-medium text-slate-200 mb-2"
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
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </section>

        {/* Members */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Team members</h3>

              <p className="text-xs text-slate-500 mt-1">
                Add the people who will actually build the SIH solution.
              </p>
            </div>

            <button
              type="button"
              onClick={addMember}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add member
            </button>
          </div>

          <div className="space-y-4">
            {profile.members.map((member, index) => (
              <div
                key={member.id}
                className="border border-slate-800 bg-slate-950/70 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Member {index + 1}
                  </span>

                  {profile.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Remove member ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`member-name-${member.id}`}
                      className="block text-xs font-medium text-slate-400 mb-2"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`member-role-${member.id}`}
                      className="block text-xs font-medium text-slate-400 mb-2"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`member-skills-${member.id}`}
                    className="block text-xs font-medium text-slate-400 mb-2"
                  >
                    Skills
                  </label>

                  <div className="w-full min-h-[46px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300"
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => removeSkill(member.id, skill)}
                          className="text-blue-400/70 hover:text-blue-200 transition-colors"
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}

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
                      placeholder={
                        member.skills.length === 0
                          ? "Type a skill and press Enter or comma"
                          : "Add another skill..."
                      }
                      className="flex-1 min-w-[180px] bg-transparent border-0 outline-none text-sm text-white placeholder:text-slate-600 py-1"
                    />
                  </div>

                  <p className="text-xs text-slate-600 mt-2">
                    Press Enter or comma to add a skill. Backspace on an empty
                    field removes the last skill.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={17} className="text-blue-400" />

            <div>
              <h3 className="text-sm font-semibold text-white">
                Team preferences
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                These will help personalize future problem recommendations.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Software only */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.preferences.softwareOnly}
                onChange={(event) =>
                  updatePreference("softwareOnly", event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
              />

              <span>
                <span className="block text-sm font-medium text-slate-200">
                  Prefer software-only problems
                </span>

                <span className="block text-xs text-slate-500 mt-1">
                  We'll eventually use this when ranking hardware-dependent SIH
                  problems.
                </span>
              </span>
            </label>

            {/* Hardware */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="hardware-comfort"
                  className="text-sm font-medium text-slate-200"
                >
                  Hardware comfort
                </label>

                <span className="text-sm font-semibold text-blue-400">
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
                className="w-full accent-blue-500"
              />
            </div>

            {/* AI/ML */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="ai-ml-comfort"
                  className="text-sm font-medium text-slate-200"
                >
                  AI / ML comfort
                </label>

                <span className="text-sm font-semibold text-blue-400">
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
                className="w-full accent-blue-500"
              />
            </div>

            {/* Willingness to learn */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="willingness-to-learn"
                  className="text-sm font-medium text-slate-200"
                >
                  Willingness to learn new technologies
                </label>

                <span className="text-sm font-semibold text-blue-400">
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
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
