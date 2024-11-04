import React, { useState, useEffect } from 'react';
import  Card from './components/ui/Card';
import  CardContent from './components/ui/CardContent';
import Input from './components/ui/Input';
import  Button from './components/ui/Button';
import { Trash2, Maximize2, Star, Globe, Loader2, ExternalLink } from 'lucide-react';
import  ScrollArea from './components/ui/ScrollArea';
import  ScrollBar from './components/ui/ScrollBar';
import { X } from 'lucide-react'; 

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
  const [selectedLink, setSelectedLink] = useState(null);
  const [loading, setLoading] = useState(false);

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

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const getUrlHostname = (url) => {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return url;
    }
  };

  const getContentType = (url) => {
    const hostname = getUrlHostname(url);
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

  const fetchLinkPreview = async (url) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const type = getContentType(url);
      
      // Simulate fetching metadata - in a real app, you'd fetch actual metadata
      const description = type === 'youtube' 
        ? 'Example YouTube video description...'
        : type === 'instagram'
          ? 'Instagram reel caption...'
          : 'Blog post excerpt...';
      
      return {
        ...DEFAULT_PREVIEW,
        title: 'Content from ' + getUrlHostname(url),
        description,
        siteName: getUrlHostname(url),
        type,
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

  const openInSite = (e, link) => {
    e.stopPropagation();
    setSelectedLink(link);
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
    <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-4 md:space-y-6">
      <div className="sticky top-0 bg-white p-3 md:p-4 shadow-md rounded-lg z-10">
        <Input
          type="url"
          placeholder="Press Ctrl+V to add link or type here..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLink()}
          className="w-full text-base md:text-lg"
        />
        {loading && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <div className="space-y-4 md:space-y-6">
        {Object.entries(groupedLinks).map(([date, dateLinks]) => (
          <div key={date} className="space-y-2">
            <h2 className="text-lg font-semibold px-2">{date}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
              {dateLinks.map(link => (
                <Card 
                  key={link.id}
                  className={`group relative transition-all hover:shadow-lg
                    ${link.priority ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center relative group">
                      {link.preview?.image ? (
                        <img 
                          src={link.preview.image} 
                          alt={link.preview.title || 'Link preview'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Globe className="w-12 h-12 text-gray-400" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm">
                        {link.preview?.title || getUrlHostname(link.url)}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {link.preview?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {link.preview?.siteName || getUrlHostname(link.url)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => togglePriority(e, link.id)}
                        className={`transition-colors hover:bg-blue-50 
                          ${link.priority ? 'text-blue-500' : 'group-hover:text-blue-500'}`}
                      >
                        <Star className="h-4 w-4" fill={link.priority ? 'currentColor' : 'none'} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => openInSite(e, link)}
                        className="hover:bg-gray-100"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => deleteLink(e, link.id)}
                        className="group-hover:text-red-500 transition-colors hover:bg-red-50"
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

      {selectedLink && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
          onClick={() => setSelectedLink(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 md:p-4 border-b">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">
                  {selectedLink.preview?.title || getUrlHostname(selectedLink.url)}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {selectedLink.preview?.description}
                </p>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLink(null)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedLink.preview?.type === 'youtube' || selectedLink.preview?.type === 'instagram' ? (
              <div className="w-full h-[calc(100%-4rem)] flex items-center justify-center bg-black">
                <iframe 
                  src={selectedLink.preview.embedUrl}
                  className="w-full h-full md:w-[80%] md:h-[80%]"
                  title="content"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <iframe 
                src={selectedLink.url}
                className="w-full h-[calc(100%-4rem)]"
                title="content"
                sandbox="allow-scripts allow-same-origin allow-forms"
                allow="fullscreen"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkManager;