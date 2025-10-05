"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, X, Plus, CheckCircle } from "lucide-react";
import Image from "next/image";
import { postService } from "@/services/postService";
import { CreatePostData, UpdatePostData, Post } from "@/models";
import { PageLoader, ButtonLoader } from "@/components";

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  readTime: string;
}

export default function CreatePost() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams.get('edit');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: "",
    isPublished: false,
    isFeatured: false,
    readTime: "5"
  });

  const categories = [
    "Technology",
    "Lifestyle",
    "Health & Wellness",
    "Food & Cooking",
    "Travel",
    "Personal Development",
    "Business",
    "Design",
    "Education",
    "Entertainment"
  ];

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  // Load post for editing
  useEffect(() => {
    if (editPostId && currentUser) {
      loadPostForEdit(editPostId);
    }
  }, [editPostId, currentUser]);

  const loadPostForEdit = async (postId: string) => {
    try {
      setIsLoadingPost(true);
      setError(null);
      const post = await postService.getPostById(postId);
      setOriginalPost(post);
      setIsEditMode(true);
      
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        category: post.category,
        tags: post.tags || [],
        featuredImage: post.featuredImage || "",
        isPublished: post.isPublished,
        isFeatured: post.isFeatured,
        readTime: post.readTime || "5"
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load post for editing");
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleInputChange = (field: keyof PostFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      if (isEditMode && originalPost) {
        const updateData: UpdatePostData = {
          id: originalPost.id!,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          tags: formData.tags,
          featuredImage: formData.featuredImage,
          isPublished: formData.isPublished,
          isFeatured: formData.isFeatured,
          readTime: formData.readTime
        };

        await postService.updatePost(updateData);
        setIsSuccess(true);
        
        setTimeout(() => {
          router.push("/my-posts");
        }, 2000);
      } else {
        const postData: CreatePostData = {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          tags: formData.tags,
          featuredImage: formData.featuredImage,
          isPublished: formData.isPublished,
          isFeatured: formData.isFeatured,
          readTime: formData.readTime
        };

        await postService.createPost(postData);
        setIsSuccess(true);

        setFormData({
          title: "",
          content: "",
          excerpt: "",
          category: "",
          tags: [],
          featuredImage: "",
          isPublished: false,
          isFeatured: false,
          readTime: "5"
        });

        setTimeout(() => {
          router.push("/my-posts");
        }, 2000);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'save'} post`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoadingPost) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Post' : 'Create New Post'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Update your post content and settings' : 'Share your thoughts with the world'}
              </p>
            </div>
          </div>
          
        </div>

        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Post {isEditMode ? 'updated' : 'saved'} successfully!
              </h3>
              <p className="text-sm text-green-600">Redirecting to your posts...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">
              Error {isEditMode ? 'updating' : 'saving'} post
            </h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Content</CardTitle>
                  <CardDescription>
                    Write your post title and content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your post title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Write a brief description of your post..."
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange("excerpt", e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your post content here..."
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      className="mt-1"
                      rows={12}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                  <CardDescription>
                    Add an image to make your post more engaging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="featuredImage">Image URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="featuredImage"
                          placeholder="https://example.com/image.jpg"
                          value={formData.featuredImage}
                          onChange={(e) => handleInputChange("featuredImage", e.target.value)}
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {formData.featuredImage && (
                      <div className="mt-4 relative w-full h-48 rounded-lg border overflow-hidden">
                        <Image
                          src={formData.featuredImage}
                          alt="Featured preview"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isPublished">Publish Now</Label>
                      <p className="text-sm text-gray-500">Make this post visible to readers</p>
                    </div>
                    <Switch
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isFeatured">Featured Post</Label>
                      <p className="text-sm text-gray-500">Highlight this post on the homepage</p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="readTime">Reading Time (minutes)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      min="1"
                      value={formData.readTime}
                      onChange={(e) => handleInputChange("readTime", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || !formData.title || !formData.content || !formData.category}
                    >
                      {isSubmitting ? (
                        <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {formData.isPublished ? (isEditMode ? "Update & Publish" : "Publish Post") : (isEditMode ? "Update Draft" : "Save Draft")}
                        </>
                      )}
                    </Button>

                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
