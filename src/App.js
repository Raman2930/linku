import React, { useState, useEffect } from 'react';
import  Card from './components/ui/Card';
import  CardContent from './components/ui/CardContent';
import Input from './components/ui/Input';
import  Button from './components/ui/Button';
import { Trash2, Maximize2, Star, Globe, Loader2, ExternalLink } from 'lucide-react';
import  ScrollArea from './components/ui/ScrollArea';
import  ScrollBar from './components/ui/ScrollBar';
import { X } from 'lucide-react'; 
import { Play } from 'lucide-react'; 

const DEFAULT_PREVIEW = {
  title: '',
  description: '',
  image: '/api/placeholder/400/200',
  siteName: '',
  type: 'link'
};

const LinkManager = () => {
  const [links, setLinks] = useState(() => {
    try {
      const savedLinks = localStorage.getItem('links');
      return savedLinks ? JSON.parse(savedLinks) : [];
    } catch (error) {
      console.error('Error loading links:', error);
      return [];
    }
  });
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('links', JSON.stringify(links));
    } catch (error) {
      console.error('Error saving links:', error);
    }
  }, [links]);

  useEffect(() => {
    const handlePaste = async (e) => {
      const pastedUrl = e.clipboardData.getData('text');
      if (pastedUrl.startsWith('http')) {
        setNewUrl(pastedUrl);
        await addLink(pastedUrl);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const getUrlHostname = (url) => {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return url;
    }
  };

  const getContentType = (url) => {
    const hostname = getUrlHostname(url).toLowerCase();
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('instagram.com')) return 'instagram';
    return 'blog';
  };

  const getEmbedUrl = (url, type) => {
    switch (type) {
      case 'youtube':
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()
          : new URLSearchParams(new URL(url).search).get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      case 'instagram':
        return `${url}embed`;
      default:
        return url;
    }
  };

  // Simulated metadata extraction - in a real app, you'd use a backend service
  const extractMetadata = async (url) => {
    const type = getContentType(url);
    const hostname = getUrlHostname(url);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (type) {
      case 'youtube':
        return {
          title: 'YouTube Video Title',
          description: 'This is an example YouTube video description that would be extracted from the video metadata...',
          siteName: 'YouTube',
          type: 'youtube'
        };
      case 'instagram':
        return {
          title: 'Instagram Post',
          description: 'Instagram post caption would appear here with hashtags and mentions...',
          siteName: 'Instagram',
          type: 'instagram'
        };
      default:
        return {
          title: `Article from ${hostname}`,
          description: 'This is the article excerpt or meta description that would be extracted from the blog post...',
          siteName: hostname,
          type: 'blog'
        };
    }
  };

  const fetchLinkPreview = async (url) => {
    try {
      setLoading(true);
      const metadata = await extractMetadata(url);
      const type = getContentType(url);
      
      return {
        ...DEFAULT_PREVIEW,
        ...metadata,
        embedUrl: getEmbedUrl(url, type)
      };
    } catch (error) {
      console.error('Error fetching preview:', error);
      return DEFAULT_PREVIEW;
    } finally {
      setLoading(false);
    }
  };

  const addLink = async (urlToAdd) => {
    const url = urlToAdd || newUrl;
    if (!url) return;

    try {
      const preview = await fetchLinkPreview(url);
      const newLink = {
        id: Date.now(),
        url,
        preview,
        date: new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short'
        }),
        priority: false,
      };

      setLinks(prevLinks => [newLink, ...prevLinks]);
      setNewUrl('');
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const deleteLink = (e, id) => {
    e.stopPropagation();
    setLinks(links.filter(link => link.id !== id));
  };

  const togglePriority = (e, id) => {
    e.stopPropagation();
    setLinks(links.map(link => 
      link.id === id ? { ...link, priority: !link.priority } : link
    ));
  };

  const handleCardClick = (link) => {
    setExpandedCard(expandedCard?.id === link.id ? null : link);
  };

  const handleDoubleClick = (url) => {
    window.open(url, '_blank');
  };

  // Group links by date
  const groupedLinks = links.reduce((groups, link) => {
    const date = link.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(link);
    return groups;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Input Box */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="relative">
                <Input
                  type="url"
                  placeholder="Type or paste any link here..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  className="w-full text-lg py-6 px-4 rounded-xl border-2 focus:border-blue-500"
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Press Ctrl+V to instantly add a link from your clipboard
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Links Grid */}
      <div className="space-y-6">
        {Object.entries(groupedLinks).map(([date, dateLinks]) => (
          <div key={date} className="space-y-4">
            <h2 className="text-xl font-semibold px-2">{date}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateLinks.map(link => (
                <Card 
                  key={link.id}
                  className={`transform transition-all duration-200 hover:-translate-y-1
                    ${link.priority ? 'ring-2 ring-blue-500' : ''}
                    ${expandedCard?.id === link.id ? 'col-span-full' : ''}`}
                  onClick={() => handleCardClick(link)}
                  onDoubleClick={() => handleDoubleClick(link.url)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className={`relative ${expandedCard?.id === link.id ? 'aspect-video' : 'aspect-[16/9]'}`}>
                      {expandedCard?.id === link.id && (link.preview?.type === 'youtube' || link.preview?.type === 'instagram') ? (
                        <iframe 
                          src={link.preview.embedUrl}
                          className="absolute inset-0 w-full h-full rounded-lg"
                          title="content"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center group">
                          {link.preview?.image ? (
                            <img 
                              src={link.preview.image} 
                              alt={link.preview.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Globe className="w-12 h-12 text-gray-400" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-base">
                        {link.preview?.title || getUrlHostname(link.url)}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {link.preview?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {link.preview?.siteName || getUrlHostname(link.url)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => togglePriority(e, link.id)}
                        className={`transition-colors hover:bg-blue-50 
                          ${link.priority ? 'text-blue-500' : 'hover:text-blue-500'}`}
                      >
                        <Star className="h-4 w-4" fill={link.priority ? 'currentColor' : 'none'} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(link.url, '_blank');
                        }}
                        className="hover:bg-gray-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => deleteLink(e, link.id)}
                        className="hover:text-red-500 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkManager;