import React, { useState, useEffect } from 'react';
import { Trash2, Link2, Star, StarOff, X } from 'lucide-react';
import Card from './components/ui/Card';
import CardContent from './components/ui/CardContent';


const CATEGORIES = [
  { id: 'reels', label: 'Reels', color: 'bg-pink-100 text-pink-800' },
  { id: 'useful', label: 'Useful', color: 'bg-green-100 text-green-800' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const LinkManager = () => {
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem('quickLinks');
    try {
      return JSON.parse(saved) || [];
    } catch {
      return [];
    }
  });
  
  const [newLink, setNewLink] = useState(null);

  // Save to localStorage whenever links change
  useEffect(() => {
    localStorage.setItem('quickLinks', JSON.stringify(links));
  }, [links]);

  // Handle paste anywhere in the document
  useEffect(() => {
    const handlePaste = async (e) => {
      const pastedText = e.clipboardData.getData('text');
      if (isValidUrl(pastedText) && !links.some(link => link.url === pastedText)) {
        setNewLink({
          url: pastedText,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(pastedText).hostname}`
        });
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [links]);

  const addLink = (category) => {
    if (!newLink) return;
    
    const linkData = {
      id: Date.now(),
      url: newLink.url,
      favicon: newLink.favicon,
      timestamp: new Date().toISOString(),
      priority: 'normal',
      category
    };
    
    setLinks(prev => [linkData, ...prev]);
    setNewLink(null);
  };

  // URL validation
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Toggle priority
  const togglePriority = (id) => {
    setLinks(links.map(link => 
      link.id === id 
        ? { ...link, priority: link.priority === 'normal' ? 'important' : 'normal' }
        : link
    ));
  };

  // Delete link
  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  // Get domain from URL
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (_) {
      return url;
    }
  };

  // Format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Group links by category
  const groupedLinks = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = links.filter(link => link.category === category.id);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-4 bg-blue-50 p-4">
        <CardContent className="text-center text-gray-600">
          Just press Ctrl+V (Cmd+V on Mac) anywhere to add a link
        </CardContent>
      </Card>

      {/* Category Selection Modal */}
      {newLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Choose Category</h3>
              <button 
                onClick={() => setNewLink(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => addLink(category.id)}
                  className={`w-full p-3 rounded-lg ${category.color} hover:opacity-90 transition-opacity`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Links by Category */}
      <div className="space-y-6">
        {CATEGORIES.map(category => (
          <div key={category.id}>
            <h2 className="text-lg font-semibold mb-2">{category.label}</h2>
            {groupedLinks[category.id]?.length ? (
              <div className="space-y-2">
                {groupedLinks[category.id].map(link => (
                  <Card key={link.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Favicon */}
                        <img 
                          src={link.favicon} 
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => e.target.src = '/api/placeholder/16/16'}
                        />
                        
                        {/* Link Preview */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <a 
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {getDomain(link.url)}
                            </a>
                            <span className="text-xs text-gray-400">
                              {formatDate(link.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {link.url}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePriority(link.id)}
                            className={`p-1 rounded-full hover:bg-gray-100 ${
                              link.priority === 'important' ? 'text-yellow-500' : 'text-gray-400'
                            }`}
                          >
                            {link.priority === 'important' ? <Star size={20} /> : <StarOff size={20} />}
                          </button>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="p-1 rounded-full hover:bg-gray-100 text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-4 text-center text-gray-500">
                  No links in {category.label.toLowerCase()} yet
                </CardContent>
              </Card>
            )}
          </div>
        ))}

        {!links.length && (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center text-gray-500">
              <Link2 className="mx-auto mb-4 text-gray-400" size={32} />
              <p>No links yet. Press Ctrl+V to add your first link!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LinkManager;
