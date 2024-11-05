
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
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('clipboardLinks', JSON.stringify(links));
  }, [links]);

  const handleImagePaste = async (clipboardData) => {
    const items = Array.from(clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      const blob = imageItem.getAsFile();
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setNewLinkImage(reader.result);
          const newLink = {
            id: Date.now(),
            image: reader.result,
            timestamp: new Date().toISOString(),
          };
          setLinks(prevLinks => [newLink, ...prevLinks]);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error processing pasted image:', error);
      }
    }
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const handlePaste = (event) => {
    const clipboardData = event.clipboardData;
    
    if (clipboardData.items) {
      const items = Array.from(clipboardData.items);
      const hasImage = items.some(item => item.type.startsWith('image/'));

      if (hasImage) {
        event.preventDefault();
        handleImagePaste(clipboardData);
      } else {
        const pastedText = clipboardData.getData('text');
        if (pastedText) {
          event.preventDefault();
          const urlMatch = pastedText.match(urlRegex);
          if (urlMatch) {
            detectAndAddUrls(pastedText);
          } else {
            addTextEntry(pastedText);
          }
          setNewLinkUrl('');
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const newLink = {
              id: Date.now(),
              image: reader.result,
              timestamp: new Date().toISOString(),
            };
            setLinks(prevLinks => [newLink, ...prevLinks]);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing dropped image:', error);
        }
      }
    } else {
      const droppedText = event.dataTransfer.getData('text');
      if (droppedText) {
        const urlMatch = droppedText.match(urlRegex);
        if (urlMatch) {
          detectAndAddUrls(droppedText);
        } else {
          addTextEntry(droppedText);
        }
      }
    }
  };

  const addTextEntry = (text) => {
    const newLink = {
      id: Date.now(),
      text: text,
      timestamp: new Date().toISOString(),
    };
    setLinks(prevLinks => [newLink, ...prevLinks]);
  };

  const detectAndAddUrls = (text) => {
    const urls = text.match(urlRegex);
    if (urls) {
      urls.forEach(url => {
        const newLink = {
          id: Date.now(),
          url: url,
          timestamp: new Date().toISOString(),
        };
        setLinks(prevLinks => [newLink, ...prevLinks]);
      });
      return true;
    }
    return false;
  };

  const copyContent = async (content, id) => {
    await navigator.clipboard.writeText(content);
    setIsCopied({ ...isCopied, [id]: true });
    setTimeout(() => {
      setIsCopied({ ...isCopied, [id]: false });
    }, 2000);
  };

  const copyImage = async (imageData, id) => {
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      setIsCopied({ ...isCopied, [id]: true });
      setTimeout(() => {
        setIsCopied({ ...isCopied, [id]: false });
      }, 2000);
    } catch (error) {
      console.error('Error copying image:', error);
    }
  };

  const ContentDisplay = ({ content, isExpanded }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
      if (contentRef.current) {
        const element = contentRef.current;
        setIsOverflowing(element.scrollHeight > element.clientHeight);
      }
    }, [content]);

    return (
      <div 
        ref={contentRef}
        className={`relative ${
          isExpanded ? 'max-h-none' : 'max-h-32 overflow-hidden'
        }`}
      >
        <pre className="whitespace-pre-wrap break-words font-sans">
          {content}
        </pre>
        {!isExpanded && isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
    );
  };

  return (
    <div 
      className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen"
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="sticky top-4 bg-white shadow-lg p-4 flex items-center justify-between rounded-lg z-10">
        <div className="flex items-center gap-2 flex-1">
          <Clipboard className="h-6 w-6" />
          <Input
            type="text"
            placeholder="Type or paste text, links, or drop images here..."
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTextEntry(newLinkUrl)}
            ref={inputRef}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <Card
            key={link.id}
            className="bg-white shadow-lg transition-all duration-200 ease-in-out"
            onClick={() => setExpandedLink(expandedLink === link.id ? null : link.id)}
          >
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyImage(link.image, link.id);
                        }}
                      >
                        {isCopied[link.id] ? (
                          <Clipboard className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : link.url ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {link.url}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="p-2 bg-white rounded shadow-lg">
                            <div className="flex items-start space-x-2">
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}`}
                                alt="favicon"
                                className="w-4 h-4"
                              />
                              <div>
                                <div className="font-medium">{new URL(link.url).hostname}</div>
                                <div className="text-sm text-gray-500 truncate">{link.url}</div>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <ContentDisplay 
                      content={link.text} 
                      isExpanded={expandedLink === link.id}
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyContent(link.url || link.text, link.id);
                    }}
                  >
                    {isCopied[link.id] ? (
                      <Clipboard className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLinks(prevLinks => prevLinks.filter(l => l.id !== link.id));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {links.length > 0 && (
        <div className="sticky bottom-4 right-4 flex justify-end">
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={() => setShowClearModal(true)}
            className="rounded-full shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showClearModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-20">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-medium">Clear clipboard?</h3>
            <p>This will delete all your saved items.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowClearModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                setLinks([]);
                setShowClearModal(false);
              }}>
                Clear All
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClipboardManager;