import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Facebook,
  Instagram,
  Plus,
  Send,
  Share2,
} from 'lucide-react';
import type { LoveSchoolState, NotionCurriculumUnit, SocialPost } from '../../types';

interface CurriculumSocialViewProps {
  state: LoveSchoolState;
  onUpdateNotionUnit: (
    id: string,
    patch: Partial<NotionCurriculumUnit> & { shareWithFamilies?: boolean }
  ) => Promise<void>;
  onCreateNotionUnit: (payload: {
    title: string;
    cohort: string;
    seasonWeek: string;
    themeSummary: string;
    familyPrompt: string;
    teacherPrep: string;
  }) => Promise<void>;
  onCreateSocialPost: (payload: {
    platform: SocialPost['platform'];
    title: string;
    caption: string;
    imageUrl: string;
    scheduledFor: string;
  }) => Promise<void>;
  onUpdateSocialPost: (id: string, patch: Partial<SocialPost>) => Promise<void>;
}

export const CurriculumSocialView: React.FC<CurriculumSocialViewProps> = ({
  state,
  onUpdateNotionUnit,
  onCreateNotionUnit,
  onCreateSocialPost,
  onUpdateSocialPost,
}) => {
  const [activeTab, setActiveTab] = useState<'notion' | 'social'>('notion');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(state.notionUnits[0]?.id || 'nu-1');
  const selectedUnit =
    state.notionUnits.find((u) => u.id === selectedUnitId) || state.notionUnits[0];

  const [themeDraft, setThemeDraft] = useState(selectedUnit?.themeSummary || '');
  const [promptDraft, setPromptDraft] = useState(selectedUnit?.familyPrompt || '');
  const [prepDraft, setPrepDraft] = useState(selectedUnit?.teacherPrep || '');
  const [savingUnit, setSavingUnit] = useState(false);

  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitCohort, setNewUnitCohort] = useState('Lower Elementary Explorers');

  // Social Studio State
  const [selectedPostId, setSelectedPostId] = useState<string>(state.socialPosts[0]?.id || 'sp-1');
  const selectedPost =
    state.socialPosts.find((p) => p.id === selectedPostId) || state.socialPosts[0];
  const [previewNetwork, setPreviewNetwork] = useState<'Instagram' | 'Facebook'>('Instagram');
  const [showNewPost, setShowNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postPlatform, setPostPlatform] = useState<SocialPost['platform']>('Both');
  const [postCaption, setPostCaption] = useState('');
  const [postImage, setPostImage] = useState(
    '/src/assets/images/social_reading_circle_1794869225385.jpg'
  );

  const handleSelectUnit = (unit: NotionCurriculumUnit) => {
    setSelectedUnitId(unit.id);
    setThemeDraft(unit.themeSummary);
    setPromptDraft(unit.familyPrompt);
    setPrepDraft(unit.teacherPrep);
  };

  const handleSaveUnit = async (shareWithFamilies = false) => {
    if (!selectedUnit) return;
    setSavingUnit(true);
    try {
      await onUpdateNotionUnit(selectedUnit.id, {
        themeSummary: themeDraft,
        familyPrompt: promptDraft,
        teacherPrep: prepDraft,
        shareWithFamilies,
      });
    } finally {
      setSavingUnit(false);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    await onCreateNotionUnit({
      title: newUnitTitle.trim(),
      cohort: newUnitCohort,
      seasonWeek: 'Autumn · Week 12',
      themeSummary: 'Weekly studio inquiry designed in Notion.',
      familyPrompt: 'Ask your child what sparked their curiosity in the studio today.',
      teacherPrep: 'Natural materials and journal paper.',
    });
    setNewUnitTitle('');
    setShowNewUnit(false);
  };

  const handleCreateSocialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postCaption.trim()) return;
    await onCreateSocialPost({
      platform: postPlatform,
      title: postTitle.trim(),
      caption: postCaption.trim(),
      imageUrl: postImage,
      scheduledFor: 'Friday · 10:00 AM',
    });
    setPostTitle('');
    setPostCaption('');
    setShowNewPost(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#14181F]">
            Notion Curriculum &amp; Social Storytelling
          </h1>
          <p className="mt-1 text-sm text-[#525C6A]">
            Turn weekly Notion learning guides into warm family digests and authentic Facebook &amp; Instagram stories.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EAECEF] rounded-lg self-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('notion')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'notion'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Notion Curriculum
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'social'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Facebook &amp; Instagram
          </button>
        </div>
      </div>

      {activeTab === 'notion' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notion Database Units */}
          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E4D3B]" />
                <h2 className="text-base font-semibold text-[#14181F]">
                  Living Curriculum DB
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNewUnit((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1E4D3B] bg-[#ECFDF5] border border-[#A7F3D0] rounded-md"
              >
                <Plus className="w-3.5 h-3.5" />
                New Unit
              </button>
            </div>

            {showNewUnit && (
              <form
                onSubmit={handleCreateUnit}
                className="p-4 bg-[#F8F9FA] border-b border-[#E5E7EB] space-y-2.5"
              >
                <input
                  type="text"
                  required
                  placeholder="Unit title..."
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <div className="flex gap-2">
                  <select
                    value={newUnitCohort}
                    onChange={(e) => setNewUnitCohort(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded-md"
                  >
                    <option value="Early Childhood Wonder">Early Childhood Wonder</option>
                    <option value="Lower Elementary Explorers">Lower Elementary Explorers</option>
                    <option value="Upper Studio Makers">Upper Studio Makers</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#14181F] rounded-md"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-[#E5E7EB]">
              {state.notionUnits.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => handleSelectUnit(unit)}
                  className={`w-full text-left p-5 transition-colors ${
                    selectedUnit?.id === unit.id ? 'bg-[#F8F9FA]' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#525C6A]">
                    <span>
                      {unit.cohort} · {unit.seasonWeek}
                    </span>
                    <span
                      className={`font-medium ${
                        unit.sharedWithFamilies ? 'text-[#15803D]' : 'text-[#B45309]'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#14181F]">{unit.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notion Unit Reader & Cross-Channel Publisher */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="aspect-[16/7] w-full bg-[#EAECEF] overflow-hidden relative">
              <img
                src="/src/assets/images/curriculum_botany_table_1794869225319.jpg"
                alt="Love School botanical curriculum table"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex flex-col justify-end p-6">
                <p className="text-xs text-white/80 font-mono">
                  Notion · {selectedUnit?.cohort} · {selectedUnit?.seasonWeek}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {selectedUnit?.title}
                </h3>
              </div>
            </div>

            {selectedUnit && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#525C6A] mb-1">
                    Weekly Learning Story
                  </label>
                  <textarea
                    rows={3}
                    value={themeDraft}
                    onChange={(e) => setThemeDraft(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-[#14181F] border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#525C6A] mb-1">
                    Home Connection Prompt (Shared with Parents)
                  </label>
                  <textarea
                    rows={2}
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-[#14181F] border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#525C6A] mb-1">
                    Educator Studio Prep
                  </label>
                  <input
                    type="text"
                    value={prepDraft}
                    onChange={(e) => setPrepDraft(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-[#14181F] border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB]">
                  <span className="text-xs text-[#525C6A]">
                    Last edited in Notion: {selectedUnit.lastEditedAt}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={savingUnit}
                      onClick={() => handleSaveUnit(false)}
                      className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB]"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      disabled={savingUnit}
                      onClick={() => handleSaveUnit(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share Weekly Guide (Email + Social)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Social Post Queue */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#14181F]">
                  Facebook &amp; Instagram Story Queue
                </h2>
                <p className="text-xs text-[#525C6A] mt-0.5">
                  Authentic glimpses inside Love School classrooms for prospective and current families.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPost((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Draft Post
              </button>
            </div>

            {showNewPost && (
              <form
                onSubmit={handleCreateSocialPost}
                className="p-6 bg-[#F8F9FA] border-b border-[#E5E7EB] space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Story headline"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                  />
                  <select
                    value={postPlatform}
                    onChange={(e) => setPostPlatform(e.target.value as SocialPost['platform'])}
                    className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                  >
                    <option value="Both">Instagram + Facebook</option>
                    <option value="Instagram">Instagram Only</option>
                    <option value="Facebook">Facebook Only</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Write a warm, human caption..."
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <select
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded-md"
                  >
                    <option value="/src/assets/images/social_reading_circle_1794869225385.jpg">
                      Photo: Cozy Reading Corner
                    </option>
                    <option value="/src/assets/images/curriculum_botany_table_1794869225319.jpg">
                      Photo: Botany Watercolor Table
                    </option>
                    <option value="/src/assets/images/school_studio_hero_1794869225291.jpg">
                      Photo: Sunlit Studio Classroom
                    </option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-[#14181F] rounded-md"
                  >
                    Add to Review Queue
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-[#E5E7EB]">
              {state.socialPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`p-5 flex gap-4 cursor-pointer transition-colors ${
                    selectedPost?.id === post.id ? 'bg-[#F8F9FA]' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-md object-cover shrink-0 border border-[#E5E7EB]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#525C6A]">
                      <span>
                        {post.platform} <span aria-hidden="true">·</span> {post.scheduledFor}
                      </span>
                      <span
                        className={`font-medium ${
                          post.status === 'Published'
                            ? 'text-[#15803D]'
                            : post.status === 'Scheduled'
                            ? 'text-[#1E4D3B]'
                            : 'text-[#B45309]'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#14181F]">{post.title}</p>
                    <p className="mt-1 text-xs text-[#525C6A] line-clamp-2">{post.caption}</p>

                    <div className="mt-3 flex items-center gap-2">
                      {post.status === 'Needs Review' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSocialPost(post.id, { status: 'Scheduled' });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve &amp; Schedule
                        </button>
                      )}
                      {post.status === 'Scheduled' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSocialPost(post.id, { status: 'Published' });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#1E4D3B] bg-[#ECFDF5] border border-[#A7F3D0] rounded-md hover:bg-[#D1FAE5]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Social Network Preview */}
          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#14181F]">Live Community Preview</h3>
              <div className="flex items-center gap-1 p-0.5 bg-[#F3F4F6] rounded-md">
                <button
                  type="button"
                  onClick={() => setPreviewNetwork('Instagram')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                    previewNetwork === 'Instagram'
                      ? 'bg-white text-[#14181F] shadow-sm'
                      : 'text-[#525C6A]'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewNetwork('Facebook')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                    previewNetwork === 'Facebook'
                      ? 'bg-white text-[#14181F] shadow-sm'
                      : 'text-[#525C6A]'
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" />
                  Facebook
                </button>
              </div>
            </div>

            {selectedPost && (
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2.5 border-b border-[#F3F4F6]">
                  <img
                    src="/src/assets/images/director_avatar_1794869226035.jpg"
                    alt="Love School account"
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#14181F]">
                      {previewNetwork === 'Instagram' ? '@loveschoolu' : 'Love School Community'}
                    </p>
                    <p className="text-[11px] text-[#525C6A]">loveschoolu.com</p>
                  </div>
                </div>
                <div className="aspect-square w-full bg-[#EAECEF] overflow-hidden">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#14181F] leading-relaxed">{selectedPost.caption}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
