import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Save,
  Share2,
  MessageCircle,
  GitBranch,
  Bold,
  Italic,
  Underline,
  List,
  Users,
} from "lucide-react";
import Navigation from "../components/Navigation";
import { useProjectStore } from "../store/projectStore";

const Editor = () => {
  const { projectId } = useParams();
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    updateChapter, 
    addChapter,
    addCollaborator,
    removeCollaborator,
    getChapterVersions,
    
    restoreChapterVersion,
    getChatMessages,
    sendChatMessage,
    createProjectShare,
    fetchProject, 
    loading, 
    error 
  } = useProjectStore();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [content, setContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  

  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const createDefaultChapter = useCallback(async () => {
    if (currentProject && (currentProject.chapters?.length ?? 0) === 0) {
      try {
        await addChapter(currentProject.id, {
          title: "Chapter 1",
          content: "",
          order: 1,
          wordCount: 0,
        });
      } catch (error) {
        console.error("Failed to create default chapter:", error);
      }
    }
  }, [currentProject, addChapter]);

  const handleAddChapter = useCallback(async () => {
    if (!currentProject) return;

    try {
      setCreatingChapter(true);
      const nextChapterNumber = (currentProject.chapters?.length ?? 0) + 1;
      await addChapter(currentProject.id, {
        title: `Chapter ${nextChapterNumber}`,
        content: "",
        order: nextChapterNumber,
        wordCount: 0,
      });
      // Select the new chapter
      setSelectedChapter(currentProject.chapters?.length ?? 0);
    } catch (error) {
      console.error("Failed to create new chapter:", error);
    } finally {
      setCreatingChapter(false);
    }
  }, [currentProject, addChapter]);

  const handleAddCollaborator = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !newCollaboratorEmail.trim()) return;

    try {
      await addCollaborator(currentProject.id, newCollaboratorEmail.trim());
      setNewCollaboratorEmail("");
    } catch (error) {
      console.error("Failed to add collaborator:", error);
    }
  }, [currentProject, newCollaboratorEmail, addCollaborator]);

  const handleRemoveCollaborator = useCallback(async (email: string) => {
    if (!currentProject) return;

    try {
      await removeCollaborator(currentProject.id, email);
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
    }
  }, [currentProject, removeCollaborator]);

  const loadVersionHistory = useCallback(async () => {
    if (!currentProject || !currentProject.chapters[selectedChapter]) return;

    try {
      setLoadingVersions(true);
      const chapterVersions = await getChapterVersions(currentProject.chapters[selectedChapter].id);
      setVersions(chapterVersions);
    } catch (error) {
      console.error("Failed to load version history:", error);
    } finally {
      setLoadingVersions(false);
    }
  }, [currentProject, selectedChapter, getChapterVersions]);

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    if (!currentProject || !currentProject.chapters[selectedChapter]) return;

    try {
      await restoreChapterVersion(currentProject.chapters[selectedChapter].id, versionId);
      // Reload version history and content
      await loadVersionHistory();
      if (currentProject.chapters[selectedChapter]) {
        setContent(currentProject.chapters[selectedChapter].content || "");
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
    }
  }, [currentProject, selectedChapter, restoreChapterVersion, loadVersionHistory]);

  // Effect to load project when projectId changes or when projects are fetched
  useEffect(() => {
    if (!projectId) return;

    // Check if the project is in the local state
    const localProject = projects.find((p) => p.id === projectId);
    
    if (localProject && (!currentProject || currentProject.id !== projectId)) {
      // If project exists locally and it's not the current project, set it
      setCurrentProject(localProject);
    } else if (!localProject && (!currentProject || currentProject.id !== projectId)) {
      // If project doesn't exist locally and it's not the current project, fetch it
      fetchProject(projectId);
    }
  }, [projectId, projects]); // Include full projects array to detect when projects are loaded

  // Separate effect to update content when project or chapter selection changes
  useEffect(() => {
    if (currentProject) {
      if ((currentProject.chapters?.length ?? 0) > 0) {
        setContent(currentProject.chapters?.[selectedChapter]?.content || "");
        // Load version history for the selected chapter
        loadVersionHistory();
      } else {
        // If project has no chapters, create a default chapter
        createDefaultChapter();
      }
    }
  }, [currentProject, selectedChapter, createDefaultChapter, loadVersionHistory]);

  const handleSave = useCallback(async () => {
    if (!currentProject || !currentProject.chapters || !currentProject.chapters[selectedChapter]) {
      console.warn("No chapter selected for saving");
      return;
    }

    try {
      setSaving(true);
      await updateChapter(
        currentProject.id,
        currentProject.chapters[selectedChapter].id,
        {
          content,
          wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        }
      );
      console.log("Chapter saved successfully");
    } catch (error) {
      console.error("Failed to save chapter:", error);
    } finally {
      setSaving(false);
    }
  }, [currentProject, selectedChapter, content, updateChapter]);

  const formatText = useCallback((format: "bold" | "italic" | "underline") => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `_${selectedText}_`;
        break;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  }, [content]);

  // Load chat messages when a chapter is selected
  const loadChatMessages = useCallback(async () => {
    if (!currentProject || selectedChapter < 0) return;
    
    try {
      setLoadingMessages(true);
      const messages = await getChatMessages(
        currentProject.id, 
        currentProject.chapters?.[selectedChapter]?.id
      );
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentProject, selectedChapter, getChatMessages]);

  // Load chat messages when chapter selection changes
  useEffect(() => {
    if (showComments) {
      loadChatMessages();
    }
  }, [showComments, selectedChapter, loadChatMessages]);

  // Send a new chat message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentProject) return;
    
    try {
      const message = await sendChatMessage(
        currentProject.id,
        newMessage,
        currentProject.chapters?.[selectedChapter]?.id
      );
      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Create a shareable link
  const handleCreateShare = async () => {
    if (!currentProject) return;
    
    try {
      const share = await createProjectShare(currentProject.id, 'read');
      // Copy to clipboard
      navigator.clipboard.writeText(share.shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error creating share:', error);
      alert('Failed to create share link');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navigation
          isCollapsed={navCollapsed}
          onToggle={() => setNavCollapsed(!navCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Navigation
          isCollapsed={navCollapsed}
          onToggle={() => setNavCollapsed(!navCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex min-h-screen">
        <Navigation
          isCollapsed={navCollapsed}
          onToggle={() => setNavCollapsed(!navCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Project not found</p>
            <button 
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Go back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation
        isCollapsed={navCollapsed}
        onToggle={() => setNavCollapsed(!navCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {currentProject.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentProject.chapters?.[selectedChapter]?.title ||
                    "New Chapter"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Collaborators */}
              <div className="flex -space-x-2 mr-4">
                {(currentProject?.collaborators || []).slice(0, 3).map((email, i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`}
                    alt={email}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    title={email}
                  />
                ))}
                {(currentProject?.collaborators || []).length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    +{(currentProject?.collaborators || []).length - 3}
                  </div>
                )}
                {(currentProject?.collaborators || []).length === 0 && (
                  <div className="text-sm text-gray-500">No collaborators</div>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !currentProject?.chapters[selectedChapter]}
                className={`px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors ${
                  saving || !currentProject?.chapters[selectedChapter]
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>

              <button 
                onClick={handleCreateShare}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Share Project"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className={`p-2 rounded ${
                  showComments
                    ? "text-blue-600 bg-blue-100"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
                title="Comments"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowCollaborators(!showCollaborators)}
                className={`p-2 rounded ${
                  showCollaborators
                    ? "text-blue-600 bg-blue-100"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
                title="Manage Collaborators"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chapter Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Chapters</h2>
              <button 
                onClick={handleAddChapter}
                disabled={creatingChapter || !currentProject}
                className={`transition-colors ${
                  creatingChapter || !currentProject
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                }`}
                title="Add new chapter"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {(currentProject.chapters || []).map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`p-3 rounded cursor-pointer ${
                    selectedChapter === index
                      ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setSelectedChapter(index)}
                >
                  <h3 className="font-medium text-sm mb-1">{chapter.title}</h3>
                  <p className="text-xs text-gray-600">
                    {chapter.wordCount} words
                  </p>
                </div>
              ))}
            </div>

            {/* Version Control */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Version History
              </h3>
              
              {loadingVersions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading versions...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {versions.length > 0 ? (
                    versions.map((version) => (
                      <div
                        key={version.id}
                        className="p-2 hover:bg-gray-50 rounded text-sm border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">
                            v{version.version}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(version.createdAt).toLocaleDateString()} {new Date(version.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{version.authorEmail}</span>
                          <button
                            onClick={() => handleRestoreVersion(version.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Restore
                          </button>
                        </div>
                        {version.changeDescription && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            {version.changeDescription}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {version.wordCount} words
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No version history available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => formatText("bold")}
                  className="p-2 hover:bg-blue-100 rounded text-gray-600 hover:text-blue-600"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText("italic")}
                  className="p-2 hover:bg-blue-100 rounded text-gray-600 hover:text-blue-600"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText("underline")}
                  className="p-2 hover:bg-blue-100 rounded text-gray-600 hover:text-blue-600"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <button className="p-2 hover:bg-blue-100 rounded text-gray-600 hover:text-blue-600">
                  <List className="w-4 h-4" />
                </button>

                <div className="ml-auto flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {content.split(" ").length} words
                  </span>
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
                style={{ fontFamily: "Georgia, serif" }}
              />
            </div>
          </div>

          {/* Comments Sidebar */}
          {showComments && (
            <div className="bg-white border-l border-gray-200 p-4 w-80">
              <h3 className="font-semibold text-gray-800 mb-4">
                Chapter Chat
                {currentProject?.chapters[selectedChapter] && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    - {currentProject.chapters[selectedChapter].title}
                  </span>
                )}
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {loadingMessages ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className="p-3 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`}
                          alt={message.userName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {message.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>
          )}

          {/* Collaborators Sidebar */}
          {showCollaborators && (
            <div className="bg-white border-l border-gray-200 p-4 w-80">
              <h3 className="font-semibold text-gray-800 mb-4">Collaborators</h3>
              
              {/* Add Collaborator Form */}
              <form onSubmit={handleAddCollaborator} className="mb-6">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite by Email
                  </label>
                  <input
                    type="email"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newCollaboratorEmail.trim()}
                  className="w-full bg-blue-500 text-white py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Invite Collaborator
                </button>
              </form>

              {/* Current Collaborators */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Current Collaborators</h4>
                {(currentProject?.collaborators || []).length === 0 ? (
                  <p className="text-gray-500 text-sm">No collaborators yet</p>
                ) : (
                  (currentProject?.collaborators || []).map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`}
                          alt={email}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{email}</p>
                          <p className="text-xs text-gray-500">Collaborator</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(email)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Collaboration Tips */}
              <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-200">
                <h5 className="font-medium text-blue-800 text-sm mb-2">Collaboration Tips</h5>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Collaborators can edit chapters and add comments</li>
                  <li>• Changes are saved automatically</li>
                  <li>• Version history tracks all changes</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
