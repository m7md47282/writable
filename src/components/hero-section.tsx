"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { postService } from "@/services/postService";
import { PageLoader } from "./ui/loader";
 

interface SlideData {
  id: string; // post id or fallback id
  title: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
  category: string;
  wordCount: number;
  authorName?: string;
  viewCount?: number;
  updatedAt?: string; // ISO string
}

const defaultSlides: SlideData[] = [
  {
    id: "default-1",
    title: "Welcome to Our Blog",
    description: "Discover amazing content and stories that inspire, educate, and entertain. Join our community of readers and writers.",
    buttonText: "Explore →",
    backgroundImage: "/images/tea.jpg",
    category: "welcome",
    wordCount: 500,
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedWordCount, setAnimatedWordCount] = useState(0);
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const currentSlideData = slides[currentSlide];
  
  const categoryRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const sliderCardsRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const rightTitleRef = useRef<HTMLHeadingElement>(null);
  const rightDescriptionRef = useRef<HTMLParagraphElement>(null);
  const rightMetaRef = useRef<HTMLDivElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);
  const wordCountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await postService.getPosts({ isPublished: true, limit: 6, sortBy: 'publishedAt', sortOrder: 'desc' }, true);
        
        if (response.success && response.data && response.data.length > 0) {
          const transformedSlides: SlideData[] = response.data.map((post) => ({
            id: post.id || "",
            title: post.title,
            description: post.excerpt,
            buttonText: "Read more →",
            backgroundImage: post.featuredImage || "/images/tea.jpg",
            category: post.category,
            wordCount: post.content ? post.content.split(' ').length : 500,
            authorName: post.authorName,
            viewCount: post.viewCount,
            updatedAt: (post.updatedAt as unknown as string) || (post.publishedAt as unknown as string),
          }));

          console.log('this is the transformed slides', transformedSlides);
          
          setSlides(transformedSlides);
        } 
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!categoryRef.current || !titleRef.current || !sliderCardsRef.current || !rightColumnRef.current) return;

    const tl = gsap.timeline();

    gsap.set([categoryRef.current, titleRef.current, sliderCardsRef.current], {
      opacity: 0,
      y: 50
    });

    gsap.set([rightTitleRef.current, rightDescriptionRef.current], {
      opacity: 0,
      y: 30
    });

    tl.to(categoryRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.4")
      .to(sliderCardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.2")
      .to(rightColumnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.4");

  }, [loading]);

  useEffect(() => {
    if (loading) return;
    if (!rightTitleRef.current || !rightDescriptionRef.current) return;

    const tl = gsap.timeline();

    gsap.set([rightTitleRef.current, rightDescriptionRef.current], {
      opacity: 0,
      y: -20,
    });

    tl.to([rightTitleRef.current, rightDescriptionRef.current], {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    })
      .to([rightTitleRef.current, rightDescriptionRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.1");

  }, [currentSlide, loading]);

  useEffect(() => {
    const targetCount = currentSlideData.wordCount;
    const duration = 0.8;
    const startTime = Date.now();
    
    const animateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 8);
      const currentCount = Math.floor(easeOutQuart * targetCount);
      
      setAnimatedWordCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    
    requestAnimationFrame(animateCount);
  }, [currentSlideData.wordCount]);

  if (loading) {
    return (
      <section className="relative min-h-screen w-full">
        <PageLoader />
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen w-full">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen w-full">
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div 
          className="flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 text-white w-full lg:w-1/2 min-h-[20vh] lg:min-h-screen"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)), url(${currentSlideData.backgroundImage})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          <div className="lg:block space-y-4 sm:space-y-6 m-auto text-center lg:text-left h-[55%]">
            <span ref={categoryRef} className="uppercase tracking-wide text-white/70 text-xs sm:text-sm ring p-2 rounded-full inline-block">
              {currentSlideData.category}
            </span>
            <div ref={titleRef} className="leading-[0.95]">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold">
                {currentSlideData.title}
              </div>
            </div>
          </div>

          <div ref={sliderCardsRef} className="flex gap-3 sm:gap-4 snap-x snap-mandatory px-2 sm:px-4 py-2 scrollbar-hide bottom-0 absolute  max-w-[95vw] overflow-x-auto pt-[40px] z-2">
            {slides.map((c, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`snap-start shrink-0 focus:outline-none relative cursor-pointer z-10 transition-all duration-300 rounded-[15px] ${i === currentSlide ? 'scale-105 translate-y-[-20px] opacity-40 selected-blog' : 'hover:scale-102'}`}
                aria-pressed={i === currentSlide}
              >
                <div
                  className={`h-[200px] w-[160px] sm:h-[240px] sm:w-[180px] lg:h-[280px] lg:w-[220px] rounded-xl overflow-hidden shadow-xl bg-cover bg-center flex flex-col transition-all duration-300 ${i === currentSlide ? 'shadow-2xl' : 'ring-1 ring-white/20 hover:ring-white/40'}`}
                  style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.7), rgba(0,0,0,.2)), url(${c.backgroundImage})` }}
                >
                  <div className="mt-2 sm:mt-3 ml-2 sm:ml-3 text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur text-white self-start font-medium">
                    {c.category}
                  </div>
                  <div className="mt-auto p-3 sm:p-4 text-left">
                    <div className="text-white text-sm sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight">
                      {c.title}
                    </div>
                    <div className="text-white/90 text-xs sm:text-sm leading-relaxed">
                      {c.description.slice(0, 60)}...
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={rightColumnRef} className="p-4 sm:p-6 lg:p-8 w-full lg:w-1/2 z-1">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 lg:p-10">

            <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-16 lg:mt-[120px]">
              <h2 ref={rightTitleRef} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {currentSlideData.title}
              </h2>
              <div ref={wordCountRef} className="text-orange-500 text-lg sm:text-xl font-semibold">
                {animatedWordCount} words
              </div>

              <p ref={rightDescriptionRef} className="text-gray-500 text-sm sm:text-base leading-relaxed">
                {currentSlideData.description}
              </p>

              <hr className="my-6 sm:my-8 border-gray-200" />

              <div ref={rightMetaRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 text-sm">
                  <div>
                    <div className="text-gray-400">Category:</div>
                    <div className="font-semibold text-gray-900 capitalize">{currentSlideData.category}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Reading time:</div>
                    <div className="font-semibold text-gray-900">{Math.ceil(animatedWordCount / 200)} min read</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Author:</div>
                    <div className="font-semibold text-gray-900">{currentSlideData.authorName || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Views:</div>
                    <div className="font-semibold text-gray-900">{currentSlideData.viewCount ?? 0}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-400">Updated:</div>
                    <div className="font-semibold text-gray-900">{formatUpdatedAgo(currentSlideData.updatedAt)}</div>
                  </div>
                </div>
                <Button
                  ref={rightButtonRef}
                  onClick={() => {
                    if (currentSlideData.id) {
                      router.push(`/posts/${currentSlideData.id}`);
                    }
                  }}
                  className="h-10 sm:h-11 rounded-full px-4 sm:px-6 text-sm sm:text-[15px] bg-white text-orange-500 border border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
                >
                  {currentSlideData.buttonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatUpdatedAgo(updatedAt?: string) {
  if (!updatedAt) return "—";
  const ts = new Date(updatedAt).getTime();
  if (Number.isNaN(ts)) return "—";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return ` ${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return ` ${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return ` ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return "just now";
}
