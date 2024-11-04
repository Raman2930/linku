
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
import { Clipboard, Image as ImageIcon } from 'lucide-react';
import {  useRef } from 'react';

const LinkManager = () => {
  const [links, setLinks] = useState([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkImage, setNewLinkImage] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [expandedLink, setExpandedLink] = useState(null);

  const inputRef = useRef(null);

  const addLink = () => {
    if (newLinkUrl || newLinkImage) {
      const newLink = {
        id: Date.now(),
        url: newLinkUrl,
        image: newLinkImage,
      };
      setLinks((prevLinks) => [newLink, ...prevLinks]);
      setNewLinkUrl('');
      setNewLinkImage(null);
      inputRef.current.value = ''; // Clear the input field
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
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePaste = (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
      const pastedData = event.clipboardData.getData('text');
      const isImage = event.clipboardData.types.includes('image');

      if (isImage) {
        const imageData = event.clipboardData.getData('image/png');
        setNewLinkImage(imageData);
        setNewLinkUrl('');
        addLink();
      } else {
        setNewLinkUrl(pastedData);
        setNewLinkImage(null);
        addLink();
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedData = event.dataTransfer.getData('text');
    const isImage = event.dataTransfer.types.includes('image');

    if (isImage) {
      const imageData = event.dataTransfer.getData('image/png');
      setNewLinkImage(imageData);
      setNewLinkUrl('');
      addLink();
    } else {
      setNewLinkUrl(droppedData);
      setNewLinkImage(null);
      addLink();
    }
  };

  const toggleExpand = (id) => {
    setExpandedLink(expandedLink === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      <div className="sticky top-4 bg-white shadow-lg p-4 flex items-center justify-between">
        <Input
          type="text"
          placeholder="Paste your link or drop an image here..."
          value={newLinkUrl}
          onChange={(e) => setNewLinkUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLink()}
          onPaste={handlePaste}
          onDrop={handleDrop}
          ref={inputRef}
          className="flex-1 mr-2"
        />
        {(newLinkUrl || newLinkImage) && (
          <Button variant="primary" onClick={addLink}>
            Paste
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
              <div className="flex items-center space-x-4 flex-1">
                {link.image && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={`data:image/png;base64,${link.image}`}
                      alt="Linked Content"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-600 hover:underline break-all flex-1 ${
                    link.url.length > 30 ? (expandedLink === link.id ? '' : 'line-clamp-2') : ''
                  }`}
                >
                  {link.url}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => copyLink(link.url)}>
                  <Copy className="h-4 w-4" />
                  {isCopied && <Clipboard className="h-4 w-4 animate-pulse text-green-500" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteLink(link.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 right-4">
        <Button variant="danger" size="icon" onClick={() => setShowClearModal(true)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showClearModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-20">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-medium">Are you sure?</h3>
            <p>This will delete all your saved links.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowClearModal(false)}>
                No
              </Button>
              <Button variant="danger" onClick={clearAll}>
                Yes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LinkManager;