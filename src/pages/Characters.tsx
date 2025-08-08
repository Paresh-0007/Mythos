import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Heart } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useProjectStore } from '../store/projectStore';

const Characters: React.FC = () => {
  const { projectId } = useParams();
  const { projects, currentProject, setCurrentProject, addCharacter, updateCharacter } = useProjectStore();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  React.useEffect(() => {
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
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-primary-200/50 flex flex-col">
          <div className="p-4 border-b border-primary-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-gray-800">Characters</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-2 rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No characters yet</p>
                <p className="text-sm text-gray-500">Create your first character to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCharacters.map((character) => (
                  <motion.div
                    key={character.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      selectedCharacter === character.id
                        ? 'bg-primary-100 border-primary-300'
                        : 'bg-white/60 border-primary-200/50 hover:bg-primary-50'
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
                          className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded"
                        >
                          {trait}
                        </span>
                      ))}
                      {character.traits.length > 3 && (
                        <span className="text-xs text-gray-500">+{character.traits.length - 3}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Character Details */}
        <div className="flex-1 flex flex-col">
          {selectedChar ? (
            <>
              <div className="bg-white/80 backdrop-blur-sm border-b border-primary-200/50 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedChar.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChar.name}`}
                      alt={selectedChar.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h1 className="font-display text-2xl font-bold text-gray-800 mb-1">
                        {selectedChar.name}
                      </h1>
                      <p className="text-gray-600">{selectedChar.description}</p>
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
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Traits */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50">
                    <h2 className="font-semibold text-gray-800 mb-4">Personality Traits</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedChar.traits.map((trait, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 px-3 py-2 rounded-lg font-medium"
                        >
                          {trait}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Backstory */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50">
                    <h2 className="font-semibold text-gray-800 mb-4">Backstory</h2>
                    <p className="text-gray-700 leading-relaxed">{selectedChar.backstory}</p>
                  </div>

                  {/* Relationships */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-primary-200/50">
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
                            <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-primary-200/30">
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
                <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Character</h3>
                <p className="text-gray-500">Choose a character from the list to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Character Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Create New Character</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Character name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Traits (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Brave, Intelligent, Stubborn"
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
                  Create Character
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Characters;