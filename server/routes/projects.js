const express = require('express');
const router = express.Router();
const { db, projects, characters, chapters, worldElements } = require('../db');
const { eq, and, count, asc, or, sql } = require('drizzle-orm');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /projects - Get all projects for the authenticated user (owned + collaborated)
router.get('/', async (req, res) => {
  try {
    // Get projects where user is owner OR collaborator
    const userProjects = await db
      .select()
      .from(projects)
      .where(
        or(
          eq(projects.userId, req.user.id), // User is the owner
          sql`${projects.collaborators}::jsonb @> ${JSON.stringify([req.user.email])}::jsonb` // User is a collaborator
        )
      );

    // For each project, get the counts of chapters, characters, and world elements
    const projectsWithCounts = await Promise.all(
      userProjects.map(async (project) => {
        const [chapterResult] = await db
          .select({ count: count() })
          .from(chapters)
          .where(eq(chapters.projectId, project.id));
        
        const [characterResult] = await db
          .select({ count: count() })
          .from(characters)
          .where(eq(characters.projectId, project.id));
        
        const [worldElementResult] = await db
          .select({ count: count() })
          .from(worldElements)
          .where(eq(worldElements.projectId, project.id));

        return {
          ...project,
          chaptersCount: chapterResult?.count || 0,
          charactersCount: characterResult?.count || 0,
          worldElementsCount: worldElementResult?.count || 0,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /projects/:id - Get a specific project with all its data
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    // Get the project (check if user is owner OR collaborator)
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          or(
            eq(projects.userId, req.user.id), // User is the owner
            sql`${projects.collaborators}::jsonb @> ${JSON.stringify([req.user.email])}::jsonb` // User is a collaborator
          )
        )
      );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all associated data
    const projectCharacters = await db
      .select()
      .from(characters)
      .where(eq(characters.projectId, projectId));

    const projectChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.projectId, projectId))
      .orderBy(asc(chapters.order));

    const projectWorldElements = await db
      .select()
      .from(worldElements)
      .where(eq(worldElements.projectId, projectId));

    // Combine everything
    const fullProject = {
      ...project,
      characters: projectCharacters,
      chapters: projectChapters,
      worldElements: projectWorldElements,
    };

    res.json(fullProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const { title, description, genre, collaborators = [] } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        title,
        description,
        genre,
        collaborators,
        userId: req.user.id,
        wordCount: 0,
      })
      .returning();

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /projects/:id - Update a project
router.put('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { title, description, genre, collaborators } = req.body;

    // Verify the project is accessible to the user (owner OR collaborator)
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          or(
            eq(projects.userId, req.user.id), // User is the owner
            sql`${projects.collaborators}::jsonb @> ${JSON.stringify([req.user.email])}::jsonb` // User is a collaborator
          )
        )
      );

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (genre !== undefined) updateData.genre = genre;
    if (collaborators !== undefined) updateData.collaborators = collaborators;
    updateData.updatedAt = new Date();

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Verify the project belongs to the user
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, req.user.id)));

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete associated data first (due to foreign key constraints)
    await db.delete(worldElements).where(eq(worldElements.projectId, projectId));
    await db.delete(characters).where(eq(characters.projectId, projectId));
    await db.delete(chapters).where(eq(chapters.projectId, projectId));
    
    // Delete the project
    await db.delete(projects).where(eq(projects.id, projectId));

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;