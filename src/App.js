
import React, { useState, useEffect } from 'react';
import  Card from './components/ui/Card';
import  CardContent from './components/ui/CardContent';
import Input from './components/ui/Input';
import  Button from './components/ui/Button';
import { Trash2, Maximize2, Star, Globe, Loader2, ExternalLink } from 'lucide-react';
import  ScrollArea from './components/ui/ScrollArea';
import  ScrollBar from './components/ui/ScrollBar';
import { X } from 'lucide-react'; 
import { 
  PencilLine,  Plus,
  Clock, Check, AlertCircle, Clock3, Filter
} from 'lucide-react';
import Textarea  from './components/ui/Textarea';
import {Play} from 'lucide-react';
import './index.css';
import './globals.css';


const PRIORITY_STATES = {
  NONE: 'none',
  PENDING: 'pending',
  DONE: 'done',
  REMAINING: 'remaining'
};

const PRIORITY_COLORS = {
  [PRIORITY_STATES.PENDING]: 'blue',
  [PRIORITY_STATES.DONE]: 'green',
  [PRIORITY_STATES.REMAINING]: 'red'
};

const PRIORITY_LABELS = {
  [PRIORITY_STATES.NONE]: 'No Status',
  [PRIORITY_STATES.PENDING]: 'Pending',
  [PRIORITY_STATES.DONE]: 'Completed',
  [PRIORITY_STATES.REMAINING]: 'Remaining'
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
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDomain, setFilterDomain] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('links', JSON.stringify(links));
    } catch (error) {
      console.error('Error saving links:', error);
    }
  }, [links]);

  const getUrlHostname = (url) => {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return url;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const addLink = () => {
    if (!newUrl) return;

    const newLink = {
      id: Date.now(),
      url: newUrl,
      date: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      }),
      timestamp: Date.now(),
      priority: PRIORITY_STATES.NONE,
      notes: '',
    };

    setLinks(prevLinks => [newLink, ...prevLinks]);
    setNewUrl('');
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
    setEditingId(null);
  };

  const cyclePriorityState = (currentState) => {
    const states = Object.values(PRIORITY_STATES);
    const currentIndex = states.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    return states[nextIndex];
  };

  const togglePriority = (id) => {
    setLinks(links.map(link => 
      link.id === id ? {
        ...link,
        priority: cyclePriorityState(link.priority)
      } : link
    ));
  };

  const updateNotes = (id) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, notes: newNote } : link
    ));
    setEditingId(null);
    setNewNote('');
  };

  const startEditing = (link) => {
    setEditingId(link.id);
    setNewNote(link.notes);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case PRIORITY_STATES.PENDING:
        return <Clock className="h-4 w-4" />;
      case PRIORITY_STATES.DONE:
        return <Check className="h-4 w-4" />;
      case PRIORITY_STATES.REMAINING:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const filterLinks = (links) => {
    return links.filter(link => {
      const domainMatch = filterDomain ? 
        getUrlHostname(link.url).includes(filterDomain.toLowerCase()) : true;
      
      switch (activeFilter) {
        case PRIORITY_STATES.PENDING:
          return link.priority === PRIORITY_STATES.PENDING && domainMatch;
        case PRIORITY_STATES.DONE:
          return link.priority === PRIORITY_STATES.DONE && domainMatch;
        case PRIORITY_STATES.REMAINING:
          return link.priority === PRIORITY_STATES.REMAINING && domainMatch;
        default:
          return domainMatch;
      }
    });
  };

  const groupedLinks = filterLinks(links).reduce((groups, link) => {
    const date = link.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(link);
    return groups;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      <div className="sticky top-4 z-10 space-y-4">
        <Card className="shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste your link here..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                className="flex-1"
              />
              <Button onClick={addLink} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-slate-100' : ''}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                {showFilters && (
                  <Card className="absolute right-0 mt-2 w-64 p-4 shadow-xl z-20 bg-white">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Filter by Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('all')}
                            className="w-full"
                          >
                            All
                          </Button>
                          <Button
                            variant={activeFilter === PRIORITY_STATES.PENDING ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter(PRIORITY_STATES.PENDING)}
                            className="w-full text-blue-500"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Pending
                          </Button>
                          <Button
                            variant={activeFilter === PRIORITY_STATES.DONE ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter(PRIORITY_STATES.DONE)}
                            className="w-full text-green-500"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                          <Button
                            variant={activeFilter === PRIORITY_STATES.REMAINING ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter(PRIORITY_STATES.REMAINING)}
                            className="w-full text-red-500"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Remaining
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Filter by Website</h3>
                        <Input
                          type="text"
                          placeholder="Enter website name..."
                          value={filterDomain}
                          onChange={(e) => setFilterDomain(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedLinks).map(([date, dateLinks]) => (
          <div key={date} className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 px-2">{date}</h2>
            <div className="grid grid-cols-1 gap-4">
              {dateLinks.map(link => (
                <Card 
                  key={link.id}
                  className={`bg-white ${link.priority !== PRIORITY_STATES.NONE ? 
                    `ring-2 ring-${PRIORITY_COLORS[link.priority]}-500` : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {getUrlHostname(link.url)}
                          </a>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock3 className="h-3 w-3 mr-1" />
                            {formatTime(link.timestamp)}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <div className="group relative">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => togglePriority(link.id)}
                              className={link.priority !== PRIORITY_STATES.NONE ? 
                                `text-${PRIORITY_COLORS[link.priority]}-500` : ''}
                            >
                              {getPriorityIcon(link.priority)}
                            </Button>
                            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                              bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap
                              opacity-0 group-hover:opacity-100 transition-opacity">
                              {PRIORITY_LABELS[link.priority]}
                            </span>
                          </div>
                          <div className="group relative">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                              bg-slate-800 text-white px-2 py-1 rounded text-xs
                              opacity-0 group-hover:opacity-100 transition-opacity">
                              Open Link
                            </span>
                          </div>
                          <div className="group relative">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteLink(link.id)}
                              className="hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                              bg-slate-800 text-white px-2 py-1 rounded text-xs
                              opacity-0 group-hover:opacity-100 transition-opacity">
                              Delete
                            </span>
                          </div>
                        </div>
                      </div>

                      {editingId === link.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write your notes, ideas, or summary..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full min-h-[100px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => updateNotes(link.id)}
                            >
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {link.notes && (
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {link.notes}
                            </p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(link)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <PencilLine className="h-4 w-4 mr-1" />
                            {link.notes ? 'Edit Notes' : 'Add Notes'}
                          </Button>
                        </div>
                      )}
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