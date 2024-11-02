import React, { useState, useEffect } from 'react';
import { Trash2, Link2, Star, StarOff, X, Search, Clock, MoveUp, Filter } from 'lucide-react';
import Card from './components/ui/Card';
import CardContent from './components/ui/CardContent';

const CATEGORIES = [
  { id: 'reels', label: 'Reels', color: 'bg-pink-100 text-pink-800' },
  { id: 'useful', label: 'Useful', color: 'bg-green-100 text-green-800' },
  { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
  { id: 'shopping', label: 'Shopping', color: 'bg-purple-100 text-purple-800' },
  { id: 'reading', label: 'Reading', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First', icon: Clock },
  { id: 'oldest', label: 'Oldest First', icon: Clock },
  { id: 'priority', label: 'Priority First', icon: Star }
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [moveLink, setMoveLink] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    localStorage.setItem('quickLinks', JSON.stringify(links));
  }, [links]);

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

  const moveToCategory = (linkId, newCategory) => {
    setLinks(links.map(link => 
      link.id === linkId ? { ...link, category: newCategory } : link
    ));
    setMoveLink(null);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const togglePriority = (id) => {
    setLinks(links.map(link => 
      link.id === id 
        ? { ...link, priority: link.priority === 'normal' ? 'important' : 'normal' }
        : link
    ));
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (_) {
      return url;
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('default', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filterAndSortLinks = (categoryLinks) => {
    let filtered = categoryLinks;
    
    if (searchTerm) {
      filtered = categoryLinks.filter(link => 
        link.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'priority':
          return b.priority === 'important' ? 1 : -1;
        default: // newest
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });
  };

  const groupedLinks = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = filterAndSortLinks(
      links.filter(link => link.category === category.id)
    );
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-gray-600 flex items-center gap-2">
              <Link2 size={20} />
              Press Ctrl+V (Cmd+V on Mac) to add a link
            </div>
            <div className="flex items-center gap-2">
              {showSearch ? (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                  <Search size={18} className="text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search links..."
                    className="bg-transparent border-none outline-none w-40"
                  />
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearch(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Search size={20} />
                </button>
              )}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-100 px-3 py-2 pr-8 rounded-lg cursor-pointer"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Filter size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>
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
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => addLink(category.id)}
                  className={`p-3 rounded-lg ${category.color} hover:opacity-90 transition-opacity`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Move Link Modal */}
      {moveLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Move to Category</h3>
              <button 
                onClick={() => setMoveLink(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => moveToCategory(moveLink, category.id)}
                  className={`p-3 rounded-lg ${category.color} hover:opacity-90 transition-opacity`}
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{category.label}</h2>
              <span className="text-sm text-gray-500">
                {groupedLinks[category.id].length} links
              </span>
            </div>
            {groupedLinks[category.id].length ? (
              <div className="space-y-2">
                {groupedLinks[category.id].map(link => (
                  <Card key={link.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={link.favicon} 
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => e.target.src = '/api/placeholder/16/16'}
                        />
                        
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

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMoveLink(link.id)}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <MoveUp size={20} />
                          </button>
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
