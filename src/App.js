
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

import {  Mic, MicOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/Tooltip';


const ClipboardManager = () => {
  // ... previous state declarations remain the same ...
  const [links, setLinks] = useState(() => {
    const savedLinks = localStorage.getItem('clipboardLinks');
    return savedLinks ? JSON.parse(savedLinks) : [];
  });
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkImage, setNewLinkImage] = useState(null);
  const [isCopied, setIsCopied] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);
  const [expandedLink, setExpandedLink] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const inputRef = useRef(null);

  // ... previous useEffect hooks remain the same ...

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  // ... rest of the component code remains exactly the same ...

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
          setLinks((prevLinks) => [newLink, ...prevLinks]);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error processing pasted image:', error);
      }
    }
  };

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
            setLinks((prevLinks) => [newLink, ...prevLinks]);
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
    setLinks((prevLinks) => [newLink, ...prevLinks]);
  };

  const addLink = () => {
    if (newLinkUrl || newLinkImage) {
      if (newLinkUrl.match(urlRegex)) {
        const newLink = {
          id: Date.now(),
          url: newLinkUrl,
          timestamp: new Date().toISOString(),
        };
        setLinks((prevLinks) => [newLink, ...prevLinks]);
      } else {
        addTextEntry(newLinkUrl);
      }
      setNewLinkUrl('');
      setNewLinkImage(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const detectAndAddUrls = (text) => {
    const urls = text.match(urlRegex);
    if (urls) {
      urls.forEach(url => {
        const newLink = {
          id: Date.now(),
          url: url,
          timestamp: new Date().toISOString(),
        };
        setLinks((prevLinks) => [newLink, ...prevLinks]);
      });
      return true;
    }
    return false;
  };

  const handleInputChange = (e) => {
    setNewLinkUrl(e.target.value);
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

  const deleteLink = (id) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
    if (expandedLink === id) {
      setExpandedLink(null);
    }
  };

  const clearAll = () => {
    setShowClearModal(false);
    setLinks([]);
    setExpandedLink(null);
    localStorage.removeItem('clipboardLinks');
  };

  const toggleExpand = (id) => {
    setExpandedLink(expandedLink === id ? null : id);
  };

  return (
    <div 
      className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen"
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="sticky top-4 bg-white shadow-lg p-4 flex items-center justify-between rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <Clipboard className="h-6 w-6" />
          <div className="relative flex-1 flex items-center">
            <Input
              type="text"
              placeholder="Type or paste text, links, or drop images here..."
              value={newLinkUrl}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
              ref={inputRef}
              className="flex-1 pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              className={`absolute right-2 ${isListening ? 'text-red-500' : ''}`}
              title={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {newLinkUrl && (
          <Button variant="default" onClick={addLink} className="ml-2">
            Save
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <Card
            key={link.id}
            className={`bg-white shadow-lg ${expandedLink === link.id ? 'h-auto' : 'h-24'}`}
            onDoubleClick={() => toggleExpand(link.id)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              {link.image ? (
                <div className="flex items-center gap-4 flex-1">
                  <img 
                    src={link.image} 
                    alt="Clipboard content" 
                    className="h-16 w-16 object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => copyImage(link.image, link.id)}
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
                      <div className="flex-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-blue-600 hover:underline break-all ${
                            link.url.length > 30 ? (expandedLink === link.id ? '' : 'line-clamp-2') : ''
                          }`}
                        >
                          {link.url}
                        </a>
                      </div>
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
                <div className="flex-1">
                  <p className={`break-all ${
                    link.text.length > 100 ? (expandedLink === link.id ? '' : 'line-clamp-2') : ''
                  }`}>
                    {link.text}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyContent(link.url || link.text, link.id)}
                >
                  {isCopied[link.id] ? (
                    <Clipboard className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteLink(link.id)}>
                  <X className="h-4 w-4" />
                </Button>
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
              <Button variant="destructive" onClick={clearAll}>
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