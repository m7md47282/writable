"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { postService } from "@/services/postService";
import { Post } from "@/models";
import { PageLoader, ButtonLoader } from "@/components";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyPosts() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  const fetchUserPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postService.getPostsByAuthor(currentUser?.uid || '');
      setPosts(response.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  const filterPosts = useCallback(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "published") {
        filtered = filtered.filter(post => post.isPublished);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter(post => !post.isPublished);
      } else if (statusFilter === "featured") {
        filtered = filtered.filter(post => post.isFeatured);
      }
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, statusFilter]);

  useEffect(() => {
    if (currentUser) {
      fetchUserPosts();
    }
  }, [currentUser, fetchUserPosts]);

  useEffect(() => {
    filterPosts();
  }, [filterPosts]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      await postService.deletePost(postToDelete.id!);
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async (post: Post) => {
    try {
      let updatedPost;
      if (post.isPublished) {
        updatedPost = await postService.unpublishPost(post.id!);
      } else {
        updatedPost = await postService.publishPost(post.id!);
      }
      
      setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update post status");
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (post: Post) => {
    if (post.isPublished) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  if (loading || isLoading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
              <p className="text-gray-600">Manage your blog posts</p>
            </div>
            <Button 
              onClick={() => router.push("/create-post")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Edit className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || statusFilter !== "all" ? "No posts found" : "No posts yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by creating your first blog post"
                    }
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button 
                      onClick={() => router.push("/create-post")}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Post
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, postIndex) => (
              <div key={post.id ?? `post-${postIndex}`} className="group relative">
                <div className="rounded-sm overflow-hidden cursor-pointer">
                  {post.featuredImage && (
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${post.featuredImage})` }}
                    >
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(post)}
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/posts/${post.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/create-post?edit=${post.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePublishToggle(post)}>
                          {post.isPublished ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setPostToDelete(post);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="py-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">{post.readTime} Mins</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">By {post.authorName || 'You'}</span>
                      <div className="text-right">
                        {post.publishedAt && (
                          <div className="text-xs text-gray-400">
                            Published {formatDate(post.publishedAt)} 
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={`${post.id ?? 'post'}-tag-${tag}`}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.viewCount || 0} 
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{postToDelete?.title}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <ButtonLoader text="Deleting..." />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
