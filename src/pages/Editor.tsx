import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save, 
  Share2, 
  MessageCircle, 
  GitBranch, 
  Eye, 
  Bold,
  Italic,
  Underline,
  List,
  Settings,
  Users
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useProjectStore } from '../store/projectStore';

const Editor: React.FC = () => {
  const { projectId } = useParams();
  const { projects, currentProject, setCurrentProject, updateChapter } = useProjectStore();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [content, setContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [collaborators] = useState([
    { id: '1', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', active: true },
    { id: '2', name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', active: false },
  ]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      if (project.chapters.length > 0) {
        setContent(project.chapters[selectedChapter]?.content || '');
      }
    }
  }, [projectId, projects, selectedChapter, setCurrentProject]);

  const handleSave = () => {
    if (currentProject && currentProject.chapters[selectedChapter]) {
      updateChapter(currentProject.id, currentProject.chapters[selectedChapter].id, {
        content,
        wordCount: content.split(' ').length
      });
    }
  };

  const formatText = (format: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  if (!currentProject) {
    return (
      <div className="flex min-h-screen">
        <Navigation isCollapsed={navCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation isCollapsed={navCollapsed} onToggle={() => setNavCollapsed(!navCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-primary-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-display text-xl font-semibold text-gray-800">
                  {currentProject.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentProject.chapters[selectedChapter]?.title || 'New Chapter'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Collaborators */}
              <div className="flex -space-x-2 mr-4">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="relative">
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                    {collaborator.active && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </motion.button>
              
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`p-2 rounded-lg transition-colors ${
                  showComments 
                    ? 'text-primary-600 bg-primary-100' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chapter Sidebar */}
          <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-primary-200/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Chapters</h2>
              <button className="text-primary-600 hover:text-primary-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {currentProject.chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  whileHover={{ x: 4 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedChapter === index
                      ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                      : 'hover:bg-primary-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedChapter(index)}
                >
                  <h3 className="font-medium text-sm mb-1">{chapter.title}</h3>
                  <p className="text-xs text-gray-600">{chapter.wordCount} words</p>
                </motion.div>
              ))}
            </div>
            
            {/* Version Control */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Version History
              </h3>
              <div className="space-y-2">
                {[
                  { version: 'v1.3', time: '2 hours ago', author: 'You' },
                  { version: 'v1.2', time: '1 day ago', author: 'Sarah Chen' },
                  { version: 'v1.1', time: '3 days ago', author: 'You' },
                ].map((version, index) => (
                  <div key={index} className="p-2 hover:bg-primary-50 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{version.version}</span>
                      <span className="text-xs text-gray-500">{version.time}</span>
                    </div>
                    <p className="text-xs text-gray-600">{version.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-primary-200/50 p-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => formatText('bold')}
                  className="p-2 hover:bg-primary-100 rounded text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => formatText('italic')}
                  className="p-2 hover:bg-primary-100 rounded text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => formatText('underline')}
                  className="p-2 hover:bg-primary-100 rounded text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Underline className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <button className="p-2 hover:bg-primary-100 rounded text-gray-600 hover:text-primary-600 transition-colors">
                  <List className="w-4 h-4" />
                </button>
                
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {content.split(' ').length} words
                  </span>
                  <button className="p-2 hover:bg-primary-100 rounded text-gray-600 hover:text-primary-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Writing Area */}
            <div className="flex-1 p-6">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your story..."
                className="w-full h-full resize-none border-none outline-none text-gray-800 leading-relaxed text-lg bg-transparent"
                style={{ fontFamily: 'Georgia, serif' }}
              />
            </div>
          </div>

          {/* Comments Sidebar */}
          {showComments && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm border-l border-primary-200/50 p-4"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Comments</h3>
              <div className="space-y-4">
                {[
                  {
                    author: 'Sarah Chen',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                    comment: 'Love the character development here!',
                    time: '2 hours ago'
                  },
                  {
                    author: 'John Smith',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                    comment: 'Maybe we should add more description to this scene?',
                    time: '1 day ago'
                  }
                ].map((comment, index) => (
                  <div key={index} className="p-3 bg-white/60 rounded-lg border border-primary-200/30">
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={comment.avatar} 
                        alt={comment.author}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-800">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 text-sm"
                  rows={3}
                />
                <button className="mt-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                  Comment
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;