import { useState } from 'react';
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
  const { projects, setCurrentProject } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [navCollapsed, setNavCollapsed] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Active Projects',
      value: projects.length.toString(),
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Words',
      value: projects.reduce((acc, p) => acc + p.wordCount, 0).toLocaleString(),
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      label: 'Collaborators',
      value: '8',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      label: 'This Week',
      value: '2.5k',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

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
                        {project.wordCount.toLocaleString()} words
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(project.updatedAt, 'MMM d')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {project.collaborators.slice(0, 3).map((email, i) => (
                          <img
                            key={i}
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`}
                            alt={email}
                            className="w-6 h-6 rounded-full border-2 border-white"
                          />
                        ))}
                        {project.collaborators.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{project.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/editor/${project.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        onClick={(e) => e.stopPropagation()}
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
              {[
                { action: 'Updated chapter "The Awakening"', project: 'Chronicles of Aethermoor', time: '2 hours ago' },
                { action: 'Added new character "Lyralei"', project: 'Chronicles of Aethermoor', time: '5 hours ago' },
                { action: 'Sarah Chen commented on your story', project: 'Chronicles of Aethermoor', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.project}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;