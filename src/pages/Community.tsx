import { useState } from 'react';
import { Heart, MessageCircle, Send, Trophy, Flame } from 'lucide-react';
import { mockPosts, mockAchievements, type Post, type Achievement } from '@/lib/api';

const tabs = ['学习动态', '讨论区', '成就'];

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-orange font-bold text-sm">
          {post.author.nickname[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-navy">{post.author.nickname}</p>
          <p className="text-xs text-navy/30">{new Date(post.timestamp).toLocaleDateString('zh-CN')}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-navy/70">{post.content}</p>
      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 text-xs transition ${
            liked ? 'text-coral' : 'text-navy/30 hover:text-coral'
          }`}
        >
          <Heart size={14} className={liked ? 'fill-coral' : ''} />
          {likeCount}
        </button>
        <span className="flex items-center gap-1 text-xs text-navy/30">
          <MessageCircle size={14} /> {post.comments}
        </span>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-xl p-4 text-center transition ${
        achievement.unlocked
          ? 'bg-white shadow-sm hover:shadow-md'
          : 'bg-warm-gray/50 opacity-50'
      }`}
    >
      <div className="text-3xl">{achievement.icon}</div>
      <p className="mt-2 text-sm font-bold text-navy">{achievement.name}</p>
      <p className="mt-0.5 text-xs text-navy/40">{achievement.description}</p>
      {achievement.unlocked && achievement.unlockedAt && (
        <p className="mt-1 text-xs text-mint">已解锁</p>
      )}
    </div>
  );
}

export default function Community() {
  const [activeTab, setActiveTab] = useState('学习动态');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(mockPosts);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: String(Date.now()),
      author: { id: '1', nickname: '语言探索者', avatar: '' },
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const streakAchievements = mockAchievements.filter((a) => a.category === 'streak');
  const courseAchievements = mockAchievements.filter((a) => a.category === 'course');
  const skillAchievements = mockAchievements.filter((a) => a.category === 'skill');
  const socialAchievements = mockAchievements.filter((a) => a.category === 'social');

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">社区</h1>
        <p className="mt-1 text-sm text-navy/50">与语言学习者交流互动</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-warm-gray p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === tab ? 'bg-white text-navy shadow-sm' : 'text-navy/40 hover:text-navy/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === '学习动态' && (
        <div className="space-y-4">
          {/* Create post */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="分享你的学习心得..."
              rows={2}
              className="w-full resize-none rounded-lg border border-warm-gray bg-warm p-3 text-sm outline-none transition focus:border-orange"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="flex items-center gap-1 rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-dark disabled:opacity-30"
              >
                <Send size={14} /> 发布
              </button>
            </div>
          </div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === '讨论区' && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === '成就' && (
        <div className="space-y-6">
          {[
            { label: '连续学习', icon: Flame, items: streakAchievements },
            { label: '课程成就', icon: Trophy, items: courseAchievements },
            { label: '技能成就', icon: Trophy, items: skillAchievements },
            { label: '社交成就', icon: Trophy, items: socialAchievements },
          ].map((group) => (
            <div key={group.label}>
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                <group.icon size={20} className="text-orange" /> {group.label}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
