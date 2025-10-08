import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Clock, 
  Users, 
  BookOpen,
  TrendingUp,
  FileText,
  Star
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useProjectStore } from '../store/projectStore';
import { format } from 'date-fns';

const Dashboard = () => {
  const { 
    projects, 
    setCurrentProject, 
    fetchProjects, 
    addProject, 
    loading, 
    error 
  } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    description: '',
    genre: ''
  });

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []); // Remove fetchProjects from dependencies to prevent infinite loop

  // Handle creating a new project
  const handleCreateProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.title.trim()) return;
    
    try {
      await addProject({
        title: newProjectData.title,
        description: newProjectData.description,
        genre: newProjectData.genre,
        collaborators: [],
        wordCount: 0
      });
      setShowCreateModal(false);
      setNewProjectData({ title: '', description: '', genre: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }, [newProjectData, addProject]);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setNewProjectData({ title: '', description: '', genre: '' });
  }, []);

  const filteredProjects = useMemo(() => 
    projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    ), [projects, searchTerm]
  );

  // Calculate total collaborators from all projects
  const stats = useMemo(() => {
    const totalCollaborators = projects.reduce((acc, project) => {
      return acc + (project.collaborators ? project.collaborators.length : 0);
    }, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyWords = projects.filter(p => {
      return new Date(p.updatedAt) > weekAgo;
    }).reduce((acc, p) => acc + (p.wordCount || 0), 0);

    return [
      {
        label: 'Active Projects',
        value: projects.length.toString(),
        icon: BookOpen,
        color: 'bg-blue-500'
      },
      {
        label: 'Total Words',
        value: projects.reduce((acc, p) => acc + (p.wordCount || 0), 0).toLocaleString(),
        icon: FileText,
        color: 'bg-green-500'
      },
      {
        label: 'Collaborators',
        value: totalCollaborators.toString(),
        icon: Users,
        color: 'bg-purple-500'
      },
      {
        label: 'This Week',
        value: weeklyWords.toLocaleString(),
        icon: TrendingUp,
        color: 'bg-orange-500'
      }
    ];
  }, [projects]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navigation isCollapsed={navCollapsed} onToggle={() => setNavCollapsed(!navCollapsed)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navigation isCollapsed={navCollapsed} onToggle={() => setNavCollapsed(!navCollapsed)} />
      
      <div className="flex-1 overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Welcome back, Writer!
            </h1>
            <p className="text-gray-600">Continue crafting your stories and building new worlds.</p>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Stories</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded font-medium flex items-center gap-2 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No projects found</h3>
                <p className="text-gray-500">Create your first story to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setCurrentProject(project)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {project.genre}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-400 mb-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs text-gray-600">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-800">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {(project.wordCount || 0).toLocaleString()} words
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(project.updatedAt), 'MMM d')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {(project.collaborators || []).slice(0, 3).map((email, i) => (
                          <img
                            key={i}
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`}
                            alt={email}
                            className="w-6 h-6 rounded-full border-2 border-white"
                          />
                        ))}
                        {(project.collaborators || []).length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{(project.collaborators || []).length - 3}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/editor/${project.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentProject(project);
                        }}
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Updated project "{project.title}"</p>
                    <p className="text-xs text-gray-600">{project.genre}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(project.updatedAt), 'MMM d')}
                  </span>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Project</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newProjectData.title}
                  onChange={(e) => setNewProjectData({...newProjectData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your story"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  value={newProjectData.genre}
                  onChange={(e) => setNewProjectData({...newProjectData, genre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a genre</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Horror">Horror</option>
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Contemporary Fiction">Contemporary Fiction</option>
                  <option value="Young Adult">Young Adult</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectData.title.trim()}
                  className="bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;