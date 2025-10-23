import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { useProjectStore } from '../store/projectStore';

const WorldBuilder = () => {
  const { projectId } = useParams();
  const { projects, currentProject, setCurrentProject, fetchProject, loading, error, addWorldElement, updateWorldElement, deleteWorldElement } = useProjectStore();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
// selectedType can be one of the element type keys OR null
  const [selectedType, setSelectedType] = useState<string | null>(null);
// selectedElement is the ID of a world element OR null
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDetails, setNewDetails] = useState(''); // optional JSON
  const [creating, setCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDetails, setEditDetails] = useState(''); // optional JSON
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const localProject = projects.find(p => p.id === projectId);
    if (localProject && (!currentProject || currentProject.id !== projectId)) {
      setCurrentProject(localProject);
    } else if (!localProject && (!currentProject || currentProject.id !== projectId)) {
      fetchProject(projectId);
    }
  }, [projectId, projects]);

  const elementTypes = [
    { type: 'location', label: 'Locations', icon: MapPin, color: 'bg-purple-500' },
    { type: 'organization', label: 'Organizations', icon: Building, color: 'bg-blue-500' },
    { type: 'magic-system', label: 'Magic Systems', icon: Sparkles, color: 'bg-green-500' },
    { type: 'culture', label: 'Cultures', icon: Users, color: 'bg-orange-500' },
    { type: 'technology', label: 'Technology', icon: Cpu, color: 'bg-gray-500' },
  ];

  const filteredElements = currentProject?.worldElements.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || element.type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  const selectedWorldElement = currentProject?.worldElements.find(e => e.id === selectedElement);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navigation isCollapsed={navCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Navigation isCollapsed={navCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.history.back()} className="text-blue-600 hover:text-blue-700">
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
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">World Builder</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search world elements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`w-full text-left p-2 rounded ${
                  !selectedType ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                All Elements
              </button>
              {elementTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 ${
                    selectedType === type.type ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
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
                    <div
                      key={element.id}
                      className={`p-4 rounded cursor-pointer border ${
                        selectedElement === element.id
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 ${elementType?.color || 'bg-gray-500'} rounded flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{element.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{element.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded inline-block">
                        {elementType?.label}
                      </div>
                    </div>
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
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const elementType = elementTypes.find(t => t.type === selectedWorldElement.type);
                      const Icon = elementType?.icon || Globe;
                      return (
                        <div className={`w-12 h-12 ${elementType?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        {selectedWorldElement.name}
                      </h1>
                      <p className="text-gray-600">{selectedWorldElement.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      onClick={() => {
                        if (!selectedWorldElement) return;
                        setEditName(selectedWorldElement.name);
                        setEditType(selectedWorldElement.type);
                        setEditDescription(selectedWorldElement.description);
                        try {
                          setEditDetails(
                            selectedWorldElement.details && Object.keys(selectedWorldElement.details).length > 0
                              ? JSON.stringify(selectedWorldElement.details, null, 2)
                              : ''
                          );
                        } catch {
                          setEditDetails('');
                        }
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      onClick={async () => {
                        if (!currentProject || !selectedElement) return;
                        const proceed = window.confirm('Delete this world element? This cannot be undone.');
                        if (!proceed) return;
                        try {
                          await deleteWorldElement(currentProject.id, selectedElement);
                          setSelectedElement(null);
                        } catch (err) {
                          console.error('Failed to delete world element', err);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded p-6 border border-gray-200">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create World Element</h2>
            
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!currentProject) return;
                const name = newName.trim();
                const type = newType as any;
                const description = newDescription.trim();
                if (!name || !type) return;
                let details: Record<string, any> = {};
                if (newDetails.trim()) {
                  try {
                    details = JSON.parse(newDetails);
                  } catch (err) {
                    alert('Details must be valid JSON');
                    return;
                  }
                }
                try {
                  setCreating(true);
                  await addWorldElement(currentProject.id, { name, type, description, details });
                  setShowCreateModal(false);
                  setNewName('');
                  setNewType('');
                  setNewDescription('');
                  setNewDetails('');
                } catch (err) {
                  console.error('Failed to create world element', err);
                } finally {
                  setCreating(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Element name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details (JSON, optional)</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='e.g. {"climate":"temperate","population":10000}'
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-6 py-2 rounded font-medium ${creating ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  {creating ? 'Creating...' : 'Create Element'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedWorldElement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit World Element</h2>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!currentProject || !selectedElement) return;
                const name = editName.trim();
                const type = editType as any;
                const description = editDescription.trim();
                if (!name || !type) return;
                let details: Record<string, any> | undefined = undefined;
                if (editDetails.trim()) {
                  try {
                    details = JSON.parse(editDetails);
                  } catch (err) {
                    alert('Details must be valid JSON');
                    return;
                  }
                }
                try {
                  setUpdating(true);
                  await updateWorldElement(currentProject.id, selectedElement, {
                    name,
                    type,
                    description,
                    ...(details !== undefined ? { details } : {}),
                  });
                  setShowEditModal(false);
                } catch (err) {
                  console.error('Failed to update world element', err);
                } finally {
                  setUpdating(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Element name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details (JSON, optional)</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='e.g. {"climate":"temperate","population":10000}'
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-6 py-2 rounded font-medium ${updating ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldBuilder;