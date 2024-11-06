
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


import { Alert } from '@/components/ui/alert';


import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/Dialog";
import {  Save, Undo, Trash} from 'lucide-react';


const ClipboardManager = () => {
  const [links, setLinks] = useState(() => {
    const savedLinks = localStorage.getItem('clipboardLinks');
    return savedLinks ? JSON.parse(savedLinks) : [];
  });
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isCopied, setIsCopied] = useState({});
  const [deletedItems, setDeletedItems] = useState([]);
  const [showUndo, setShowUndo] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('40px');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const inputRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('clipboardLinks', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    if (inputRef.current) {
      resizeObserverRef.current = new ResizeObserver(entries => {
        for (let entry of entries) {
          setTextareaHeight(`${entry.contentRect.height}px`);
        }
      });

      resizeObserverRef.current.observe(inputRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      setNewLinkUrl(clipboardData);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleSave = () => {
    if (!newLinkUrl.trim()) return;

    const newItem = {
      id: Date.now(),
      text: newLinkUrl,
      timestamp: new Date().toISOString()
    };

    try {
      new URL(newLinkUrl);
      newItem.url = newLinkUrl;
      delete newItem.text;
    } catch {}

    setLinks(prevLinks => [newItem, ...prevLinks]);
    setNewLinkUrl('');
  };

  const copyContent = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(prev => ({ ...prev, [id]: true }));
      setShowCopiedAlert(true);
      
      setTimeout(() => {
        setIsCopied(prev => ({ ...prev, [id]: false }));
        setShowCopiedAlert(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = (item) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== item.id));
    setDeletedItems([item]);
    setShowUndo(true);
    
    setTimeout(() => {
      setShowUndo(false);
      setDeletedItems([]);
    }, 4000);
  };

  const handleUndo = () => {
    if (deletedItems.length > 0) {
      setLinks(prevLinks => [...deletedItems, ...prevLinks]);
      setDeletedItems([]);
      setShowUndo(false);
    }
  };

  const handleClearAll = () => {
    setDeletedItems(links);
    setLinks([]);
    setShowUndo(true);
    setIsConfirmOpen(false);
    setTimeout(() => {
      setShowUndo(false);
      setDeletedItems([]);
    }, 4000);
  };

  const clearInput = () => {
    setNewLinkUrl('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      {showCopiedAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className="bg-green-50 border-green-200 text-green-800">
            Copied to clipboard
          </Alert>
        </div>
      )}
      
      {showUndo && (
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            onClick={handleUndo}
            variant="secondary"
            className="bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2"
          >
            <Undo className="h-4 w-4" />
            Undo Delete
          </Button>
        </div>
      )}

      <div className="sticky top-4 bg-white shadow-lg p-4 rounded-lg z-10 w-full">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="relative flex items-start">
                <div className="absolute left-3 top-2.5 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePasteFromClipboard}
                          className="h-6 w-6 p-0 hover:bg-gray-100 text-gray-500"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Paste from clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  placeholder="Type or paste text, links, or drop images here..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  ref={inputRef}
                  className="w-full pl-12 pr-12 min-h-[40px] resize-y"
                  style={{
                    height: textareaHeight,
                    maxHeight: '200px'
                  }}
                />
                {newLinkUrl && (
                  <div className="absolute right-3 top-2.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearInput}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clear input</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {newLinkUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSave}
                        size="icon"
                        className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save to list</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {links.length > 0 && (
                <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear all items?</DialogTitle>
                      <DialogDescription>
                        This will remove all items from your clipboard history. This action can be undone for a few seconds after clearing.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsConfirmOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleClearAll}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clear All
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

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
                    <div className="whitespace-pre-wrap break-words font-sans">
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
                          onClick={() => handleDelete(link)}
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
  );
};

export default ClipboardManager;