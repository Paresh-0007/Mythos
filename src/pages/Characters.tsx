import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, Heart } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useProjectStore } from '../store/projectStore';

const Characters = () => {
  const { projectId } = useParams();
  const { projects, currentProject, setCurrentProject, addCharacter, updateCharacter } = useProjectStore();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  }, [projectId, projects, setCurrentProject]);

  const filteredCharacters = currentProject?.characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedChar = currentProject?.characters.find(c => c.id === selectedCharacter);

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
        {/* Characters List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Characters</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No characters yet</p>
                <p className="text-sm text-gray-500">Create your first character to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    className={`p-4 rounded cursor-pointer transition-all border ${
                      selectedCharacter === character.id
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCharacter(character.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={character.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
                        alt={character.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{character.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{character.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {character.traits.slice(0, 3).map((trait, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                        >
                          {trait}
                        </span>
                      ))}
                      {character.traits.length > 3 && (
                        <span className="text-xs text-gray-500">+{character.traits.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Character Details */}
        <div className="flex-1 flex flex-col">
          {selectedChar ? (
            <>
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedChar.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChar.name}`}
                      alt={selectedChar.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        {selectedChar.name}
                      </h1>
                      <p className="text-gray-600">{selectedChar.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Traits */}
                  <div className="bg-white rounded p-6 border border-gray-200">
                    <h2 className="font-semibold text-gray-800 mb-4">Personality Traits</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedChar.traits.map((trait, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Backstory */}
                  <div className="bg-white rounded p-6 border border-gray-200">
                    <h2 className="font-semibold text-gray-800 mb-4">Backstory</h2>
                    <p className="text-gray-700 leading-relaxed">{selectedChar.backstory}</p>
                  </div>

                  {/* Relationships */}
                  <div className="bg-white rounded p-6 border border-gray-200">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Relationships
                    </h2>
                    {selectedChar.relationships.length === 0 ? (
                      <p className="text-gray-500">No relationships defined yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedChar.relationships.map((rel, index) => {
                          const relatedChar = currentProject.characters.find(c => c.id === rel.characterId);
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200">
                              <img
                                src={relatedChar?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${relatedChar?.name}`}
                                alt={relatedChar?.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{relatedChar?.name}</p>
                                <p className="text-sm text-gray-600">{rel.relationship}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Character</h3>
                <p className="text-gray-500">Choose a character from the list to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Character Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Character</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Character name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Traits (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Brave, Intelligent, Stubborn"
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
                  className="bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600"
                >
                  Create Character
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Characters;