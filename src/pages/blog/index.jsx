import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Heart, ArrowRight } from 'lucide-react';
import { blogService } from 'services/supabaseService';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Button from 'components/ui/Button';
import { format } from 'date-fns';

export default function CommunityBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService?.getAll();
      setPosts(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section with Urban Background */}
      <section 
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/images/BlackTop_Bacground-1766314848191.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Community <span className="text-cyan-500">Blog</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stories from the streets, insights from the industry, and voices from the BlaccTop community.
          </p>
        </div>
      </section>
      {/* Blog Posts Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6]?.map((i) => (
                <div key={i} className="bg-white/5 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
              <Button onClick={loadPosts} className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400">
                Try Again
              </Button>
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No blog posts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <article
                  key={post?.id}
                  className="group bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
                >
                  {/* Post Image */}
                  <div className="aspect-video overflow-hidden bg-black/50">
                    <img
                      src={post?.cover_image_url || '/assets/images/BlackTop_Bacground-1766314848191.jpg'}
                      alt={post?.title || 'Blog post'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    {/* Category */}
                    {post?.category && (
                      <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-500 rounded-full mb-4">
                        {post?.category}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-500 transition-colors">
                      {post?.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {post?.excerpt || post?.content?.substring(0, 150) + '...'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{post?.user_profiles?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{post?.published_at ? format(new Date(post?.published_at), 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post?.views_count?.toLocaleString() || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post?.likes_count?.toLocaleString() || 0} likes</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <Link to={`/blog/${post?.slug}`}>
                      <Button variant="ghost" className="w-full text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}