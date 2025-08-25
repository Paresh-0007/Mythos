import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MapPin, 
  Building, 
  Sparkles, 
  Globe,
  Users,
  Cpu,
  Edit,
  Trash2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useProjectStore, WorldElement } from '../store/projectStore';

const WorldBuilder: React.FC = () => {
  const { projectId } = useParams();
  const { projects, currentProject, setCurrentProject, addWorldElement } = useProjectStore();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  React.useEffect(() => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  }, [projectId, projects, setCurrentProject]);

  const elementTypes = [
    { type: 'location', label: 'Locations', icon: MapPin, color: 'from-accent-400 to-accent-600' },
    { type: 'organization', label: 'Organizations', icon: Building, color: 'from-primary-400 to-primary-600' },
    { type: 'magic-system', label: 'Magic Systems', icon: Sparkles, color: 'from-secondary-400 to-secondary-600' },
    { type: 'culture', label: 'Cultures', icon: Users, color: 'from-warm-400 to-warm-600' },
    { type: 'technology', label: 'Technology', icon: Cpu, color: 'from-gray-400 to-gray-600' },
  ];

  const filteredElements = currentProject?.worldElements.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || element.type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  const selectedWorldElement = currentProject?.worldElements.find(e => e.id === selectedElement);

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
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-primary-200/50 flex flex-col">
          <div className="p-4 border-b border-primary-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-gray-800">World Builder</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-2 rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search world elements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50"
              />
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  !selectedType ? 'bg-primary-100 text-primary-700' : 'hover:bg-primary-50 text-gray-700'
                }`}
              >
                All Elements
              </button>
              {elementTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedType === type.type ? 'bg-primary-100 text-primary-700' : 'hover:bg-primary-50 text-gray-700'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {filteredElements.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No world elements yet</p>
                <p className="text-sm text-gray-500">Create your first world element to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredElements.map((element) => {
                  const elementType = elementTypes.find(t => t.type === element.type);
                  const Icon = elementType?.icon || Globe;
                  
                  return (
                    <motion.div
                      key={element.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedElement === element.id
                          ? 'bg-primary-100 border-primary-300'
                          : 'bg-white/60 border-primary-200/50 hover:bg-primary-50'
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-br ${elementType?.color || 'from-gray-400 to-gray-600'} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{element.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{element.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded inline-block">
                        {elementType?.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedWorldElement ? (
            <>
              <div className="bg-white/80 backdrop-blur-sm border-b border-primary-200/50 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const elementType = elementTypes.find(t => t.type === selectedWorldElement.type);
                      const Icon = elementType?.icon || Globe;
                      return (
                        <div className={`w-12 h-12 bg-gradient-to-br ${elementType?.color || 'from-gray-400 to-gray-600'} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h1 className="font-display text-2xl font-bold text-gray-800 mb-1">
                        {selectedWorldElement.name}
                      </h1>
                      <p className="text-gray-600">{selectedWorldElement.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50">
                    <h2 className="font-semibold text-gray-800 mb-4">Details</h2>
                    <div className="space-y-4">
                      {Object.entries(selectedWorldElement.details).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-200 pb-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a World Element</h3>
                <p className="text-gray-500">Choose an element from the list to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Element Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Create World Element</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Element name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select a type</option>
                  {elementTypes.map((type) => (
                    <option key={type.type} value={type.type}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Create Element
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorldBuilder;