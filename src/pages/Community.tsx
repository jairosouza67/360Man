import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuthStore } from '../stores/authStore';
import { Heart, MessageCircle, Share2, Flag, X, Users, Send, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  images: File[];
}

const COMMUNITY_RULES = [
  'Respeito acima de tudo - sem discurso de ódio',
  'Conteúdo construtivo e voltado para evolução',
  'Sem misoginia, machismo tóxico ou discurso de ódio',
  'Conteúdo sexual apenas em áreas apropriadas',
  'Mantenha o foco em crescimento pessoal'
];

const COMMUNITY_TAGS = [
  'Introdução', 'Progresso', 'Dúvida', 'Motivação', 'Relacionamentos',
  'Treino', 'Alimentação', 'Sono', 'Leitura', 'Desafio', 'Vitória',
  'Frustração', 'Reflexão', 'Agradecimento', 'Pedido de Ajuda'
];

export default function Community() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    loadPosts();
  }, [selectedTag]);

  const loadPosts = async () => {
    try {
      setLoading(true);

      const postsRef = collection(db, 'posts');
      let q = query(
        postsRef,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (selectedTag) {
        q = query(q, where('tags', 'array-contains', selectedTag));
      }

      const querySnapshot = await getDocs(q);
      const postsData: Post[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName || 'Usuário Anônimo',
          userAvatar: data.userAvatar,
          title: data.title,
          content: data.content,
          images: data.images || [],
          tags: data.tags || [],
          likes: data.likes || 0,
          comments: data.comments || 0,
          isLiked: false,
          isActive: data.isActive,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('postId', '==', postId),
        where('isActive', '==', true),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const commentsData: Comment[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        commentsData.push({
          id: doc.id,
          postId: data.postId,
          userId: data.userId,
          userName: data.userName || 'Usuário Anônimo',
          userAvatar: data.userAvatar,
          content: data.content,
          likes: data.likes || 0,
          isLiked: false,
          isActive: data.isActive,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });

      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCreatePost = async (data: CreatePostData) => {
    try {
      const now = new Date().toISOString();
      const newPostData = {
        userId: user?.id || 'guest',
        userName: user?.name || 'Usuário Anônimo',
        title: data.title,
        content: data.content,
        images: [],
        tags: data.tags,
        likes: 0,
        comments: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'posts'), newPostData);

      const newPost: Post = {
        id: docRef.id,
        ...newPostData,
        isLiked: false
      } as Post;

      setPosts([newPost, ...posts]);
      setShowCreatePost(false);
      toast.success('Post criado com sucesso!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao criar post. Tente novamente.');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newLikeCount = post.isLiked ? post.likes - 1 : post.likes + 1;
      const newIsLiked = !post.isLiked;

      const docRef = doc(db, 'posts', postId);
      await updateDoc(docRef, { likes: newLikeCount });

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, likes: newLikeCount, isLiked: newIsLiked }
          : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCreateComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;

    try {
      const now = new Date().toISOString();
      const commentData = {
        postId: selectedPost.id,
        userId: user.id,
        userName: user.name,
        content: newComment.trim(),
        likes: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'comments'), commentData);

      const newCommentData: Comment = {
        id: docRef.id,
        ...commentData
      } as Comment;

      setComments([...comments, newCommentData]);
      setNewComment('');

      // Update post comment count
      const postRef = doc(db, 'posts', selectedPost.id);
      await updateDoc(postRef, {
        comments: selectedPost.comments + 1
      });

      setPosts(posts.map(p =>
        p.id === selectedPost.id
          ? { ...p, comments: p.comments + 1 }
          : p
      ));

      setSelectedPost({ ...selectedPost, comments: selectedPost.comments + 1 });
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleReportContent = async (type: 'post' | 'comment', id: string) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.id,
        targetId: id,
        targetType: type,
        reason: 'inappropriate',
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      alert('Conteúdo reportado. Obrigado por ajudar a manter a comunidade segura.');
    } catch (error) {
      console.error('Error reporting content:', error);
    }
  };

  // Calculate trending posts (mock logic: top 3 by likes)
  const trendingPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando comunidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl border border-white/5">
              <Users className="h-8 w-8 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Comunidade</h1>
              <p className="text-zinc-400">Conecte-se com outros homens na jornada de evolução</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-105 flex items-center justify-center space-x-2 font-medium"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Criar Discussão</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mobile Categories (visible only on small screens) */}
          <div className="lg:hidden flex flex-wrap gap-2 pb-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedTag === ''
                ? 'bg-white text-dark-950 border-white'
                : 'bg-dark-850 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
            >
              Todos
            </button>
            {COMMUNITY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedTag === tag
                  ? 'bg-primary-500/20 text-primary-300 border-primary-500/50'
                  : 'bg-dark-850 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {posts.map(post => (
            <div key={post.id} className="bg-dark-850 rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all group">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                    <span className="text-zinc-300 font-semibold">
                      {post.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{post.userName}</div>
                    <div className="text-sm text-zinc-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReportContent('post', post.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-2"
                    title="Reportar conteúdo"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-5 cursor-pointer" onClick={() => {
                setSelectedPost(post);
                loadComments(post.id);
              }}>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">{post.title}</h3>
                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed line-clamp-3">{post.content}</p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white/5 text-zinc-400 text-xs rounded-lg border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      loadComments(post.id);
                    }}
                    className="flex items-center space-x-2 text-zinc-500 hover:text-primary-400 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-20 bg-dark-850/50 rounded-2xl border border-white/5 border-dashed">
              <div className="text-zinc-600 mb-4">
                <MessageCircle className="h-16 w-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhum post ainda
              </h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Seja o primeiro a compartilhar sua jornada, dúvidas ou vitórias com a comunidade ManUp 360.
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-white text-dark-950 px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
              >
                Criar primeiro post
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Trending Topics */}
          <div className="bg-dark-850 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="bg-primary-500/20 p-1.5 rounded-lg mr-3">
                <Users className="h-4 w-4 text-primary-400" />
              </span>
              Tópicos em Alta
            </h3>
            <div className="space-y-4">
              {trendingPosts.length > 0 ? (
                trendingPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedPost(post);
                      loadComments(post.id);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl font-bold text-white/10 group-hover:text-primary-500/50 transition-colors">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-white font-medium group-hover:text-primary-400 transition-colors line-clamp-2 text-sm">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-zinc-500">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" /> {post.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" /> {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">Nenhum tópico em alta ainda.</p>
              )}
            </div>
          </div>

          {/* Categories (Desktop) */}
          <div className="hidden lg:block bg-dark-850 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Categorias</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${selectedTag === ''
                  ? 'bg-white text-dark-950'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span>Todos</span>
                {selectedTag === '' && <div className="w-2 h-2 rounded-full bg-dark-950" />}
              </button>
              {COMMUNITY_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${selectedTag === tag
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/20'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span>{tag}</span>
                  {selectedTag === tag && <div className="w-2 h-2 rounded-full bg-primary-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Community Rules */}
          <div className="bg-primary-500/5 rounded-2xl border border-primary-500/10 p-6">
            <h4 className="text-sm font-bold text-primary-400 uppercase tracking-wide mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Regras
            </h4>
            <div className="space-y-3">
              {COMMUNITY_RULES.map((rule, index) => (
                <div key={index} className="flex items-start space-x-2 text-zinc-400 text-xs leading-relaxed">
                  <span className="text-primary-500/50 mt-0.5">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          comments={comments}
          newComment={newComment}
          onClose={() => setSelectedPost(null)}
          onLikePost={handleLikePost}
          onCreateComment={handleCreateComment}
          onSetNewComment={setNewComment}
          onReportContent={handleReportContent}
        />
      )}
    </div>
  );
}

function CreatePostModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: CreatePostData) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Por favor, preencha título e conteúdo');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        images: []
      });
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Erro ao criar post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-dark-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-slide-up">
        <div className="p-6 border-b border-white/10 sticky top-0 bg-dark-900/95 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Criar novo post</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-dark-850 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="Dê um título interessante..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-dark-850 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
              placeholder="Compartilhe sua experiência, dúvida ou reflexão..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tags (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${selectedTags.includes(tag)
                    ? 'bg-primary-500/20 text-primary-300 border-primary-500/50'
                    : 'bg-dark-850 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 font-medium"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostDetailModal({
  post,
  comments,
  newComment,
  onClose,
  onLikePost,
  onCreateComment,
  onSetNewComment,
  onReportContent
}: {
  post: Post;
  comments: Comment[];
  newComment: string;
  onClose: () => void;
  onLikePost: (postId: string) => void;
  onCreateComment: () => void;
  onSetNewComment: (value: string) => void;
  onReportContent: (type: 'post' | 'comment', id: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-dark-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-slide-up">
        <div className="p-6 border-b border-white/10 sticky top-0 bg-dark-900/95 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Discussão</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Post Content */}
          <div className="mb-8 pb-8 border-b border-white/5">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                <span className="text-zinc-300 font-bold text-lg">
                  {post.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-bold text-white text-lg">{post.userName}</div>
                <div className="text-sm text-zinc-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">{post.title}</h3>
            <p className="text-zinc-300 whitespace-pre-wrap mb-6 leading-relaxed text-lg">{post.content}</p>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 text-zinc-400 text-sm rounded-lg border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-6">
              <button
                onClick={() => onLikePost(post.id)}
                className={`flex items-center space-x-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'
                  }`}
              >
                <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="text-base font-medium">{post.likes}</span>
              </button>
              <button
                onClick={() => onReportContent('post', post.id)}
                className="flex items-center space-x-2 text-zinc-500 hover:text-red-400 transition-colors ml-auto"
              >
                <Flag className="h-4 w-4" />
                <span className="text-sm">Reportar</span>
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-6 mb-8">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary-400" />
              <span>Comentários ({comments.length})</span>
            </h4>

            {comments.map(comment => (
              <div key={comment.id} className="bg-dark-850 rounded-xl p-5 border border-white/5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-dark-800 rounded-full flex items-center justify-center border border-white/5">
                    <span className="text-zinc-400 text-xs font-bold">
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{comment.userName}</div>
                    <div className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm mb-3 pl-11 leading-relaxed">{comment.content}</p>
                <div className="flex items-center space-x-4 pl-11">
                  <button className="text-xs text-zinc-500 hover:text-white transition-colors font-medium">
                    Curtir
                  </button>
                  <button
                    onClick={() => onReportContent('comment', comment.id)}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Reportar
                  </button>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-12 border border-white/5 rounded-xl bg-dark-850/30">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 text-zinc-600" />
                <p className="text-zinc-400">Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>

          {/* New Comment Input */}
          < div className="flex items-start space-x-4 bg-dark-850 p-4 rounded-xl border border-white/5 sticky bottom-0" >
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => onSetNewComment(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
                placeholder="Escreva um comentário..."
              />
            </div>
            <button
              onClick={onCreateComment}
              disabled={!newComment.trim()}
              className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}