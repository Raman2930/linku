
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
import {Copy} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {Image} from 'lucide-react';
import { Link, Clipboard, Image as ImageIcon } from 'lucide-react';
import {  useRef } from 'react';
import { TooltipProvider, TooltipTrigger, TooltipContent } from './components/ui/Tooltip';

import { Tooltip } from './components/ui/Tooltip';
import {Save} from 'lucide-react';



const ClipboardManager = () => {
  const [links, setLinks] = useState(() => {
    const savedLinks = localStorage.getItem('clipboardLinks');
    return savedLinks ? JSON.parse(savedLinks) : [];
  });
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkImage, setNewLinkImage] = useState(null);
  const [isCopied, setIsCopied] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);
  const [expandedLink, setExpandedLink] = useState(null);
  const [linkPreviews, setLinkPreviews] = useState({});
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('clipboardLinks', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [links]);

  const handleClear = () => {
    setNewLinkUrl('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const addTextEntry = (text) => {
    if (!text.trim()) return;
    
    const newEntry = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    setLinks(prevLinks => [...prevLinks, newEntry]);
  };

  const handleSave = () => {
    if (newLinkUrl.trim()) {
      addTextEntry(newLinkUrl);
      handleClear();
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        const urlMatch = clipboardText.match(urlRegex);
        if (urlMatch) {
          urlMatch.forEach(url => {
            setLinks(prevLinks => [...prevLinks, {
              id: Date.now(),
              url,
              timestamp: new Date().toISOString()
            }]);
          });
        } else {
          addTextEntry(clipboardText);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const copyContent = (content, id) => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied({ ...isCopied, [id]: true });
      setTimeout(() => {
        setIsCopied({ ...isCopied, [id]: false });
      }, 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      <div className="sticky top-4 bg-white shadow-lg p-4 rounded-lg z-10">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePaste}
                  className="h-10 w-10 p-2 flex items-center justify-center hover:bg-gray-100"
                >
                  <Clipboard className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste from clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type or paste text, links, or drop images here..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              ref={inputRef}
              className="w-full pr-12 h-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              {newLinkUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear input</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {newLinkUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSave}
                    size="default"
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save to list</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <div className="overflow-hidden" ref={scrollRef}>
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {link.image ? (
                      <div className="flex items-center gap-4">
                        <img 
                          src={link.image} 
                          alt="Clipboard content" 
                          className="h-16 w-16 object-cover rounded"
                        />
                      </div>
                    ) : link.url ? (
                      <div className="flex items-center gap-2">
                        {linkPreviews[link.id]?.favicon && (
                          <img 
                            src={linkPreviews[link.id].favicon} 
                            alt="site icon" 
                            className="w-4 h-4"
                          />
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-words inline-flex items-center gap-1"
                        >
                          {link.url}
                          <ExternalLink className="h-3 w-3 inline-block" />
                        </a>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words font-sans overflow-wrap-break-word">
                        {link.text}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyContent(link.url || link.text, link.id)}
                            className="hover:bg-gray-100"
                          >
                            {isCopied[link.id] ? (
                              <Clipboard className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setLinks(prevLinks => prevLinks.filter(l => l.id !== link.id))}
                            className="hover:bg-gray-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove from list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClipboardManager;