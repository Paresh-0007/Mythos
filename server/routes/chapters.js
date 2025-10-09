const express = require('express');
const router = express.Router();
const { db, chapters, projects, chapterVersions } = require('../db');
const { eq, and, asc, or, sql, desc } = require('drizzle-orm');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper function to verify project access (owner OR collaborator)
async function verifyProjectAccess(projectId, userId, userEmail) {
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        or(
          eq(projects.userId, userId), // User is the owner
          sql`${projects.collaborators}::jsonb @> ${JSON.stringify([userEmail])}::jsonb` // User is a collaborator
        )
      )
    )
    .limit(1);
  return project;
}

// Helper function to calculate word count
function calculateWordCount(content) {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Helper function to save a chapter version
async function saveChapterVersion(chapterId, title, content, wordCount, authorId, authorEmail, changeDescription = null) {
  try {
    // Get the current highest version number for this chapter
    const [latestVersion] = await db
      .select({ version: chapterVersions.version })
      .from(chapterVersions)
      .where(eq(chapterVersions.chapterId, chapterId))
      .orderBy(desc(chapterVersions.version))
      .limit(1);
    
    const nextVersion = (latestVersion?.version || 0) + 1;
    
    const [newVersion] = await db
      .insert(chapterVersions)
      .values({
        chapterId,
        version: nextVersion,
        title,
        content,
        wordCount,
        authorId,
        authorEmail,
        changeDescription,
      })
      .returning();
    
    return newVersion;
  } catch (error) {
    console.error('Error saving chapter version:', error);
    throw error;
  }
}

// Helper function to update project word count
async function updateProjectWordCount(projectId) {
  const projectChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.projectId, projectId));
  
  const totalWordCount = projectChapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0);
  
  await db
    .update(projects)
    .set({ wordCount: totalWordCount, updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

// GET /chapters/project/:projectId - Get all chapters for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Verify project access (owner or collaborator)
    const project = await verifyProjectAccess(projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const projectChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.projectId, projectId))
      .orderBy(asc(chapters.order));

    res.json(projectChapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// GET /chapters/:id - Get a specific chapter
router.get('/:id', async (req, res) => {
  try {
    const chapterId = parseInt(req.params.id);
    
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify project access (owner or collaborator)
    const project = await verifyProjectAccess(chapter.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Chapter not found or access denied' });
    }

    res.json(chapter);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// POST /chapters - Create a new chapter
router.post('/', async (req, res) => {
  try {
    const { title, content = '', order, projectId } = req.body;

    if (!title || order === undefined || !projectId) {
      return res.status(400).json({ error: 'Title, order, and projectId are required' });
    }

    // Verify project access (owner or collaborator)
    const project = await verifyProjectAccess(projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const wordCount = calculateWordCount(content);

    const [newChapter] = await db
      .insert(chapters)
      .values({
        title,
        content,
        order,
        wordCount,
        projectId,
      })
      .returning();

    // Save initial version
    await saveChapterVersion(
      newChapter.id,
      newChapter.title,
      newChapter.content,
      newChapter.wordCount,
      req.user.id,
      req.user.email,
      'Initial chapter creation'
    );

    // Update project word count
    await updateProjectWordCount(projectId);

    res.status(201).json(newChapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// PUT /chapters/:id - Update a chapter
router.put('/:id', async (req, res) => {
  try {
    const chapterId = parseInt(req.params.id);
    const { title, content, order } = req.body;

    // Get the chapter and verify ownership
    const [existingChapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!existingChapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify project access (owner or collaborator)
    const project = await verifyProjectAccess(existingChapter.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Chapter not found or access denied' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      updateData.wordCount = calculateWordCount(content);
    }
    if (order !== undefined) updateData.order = order;
    updateData.updatedAt = new Date();

    const [updatedChapter] = await db
      .update(chapters)
      .set(updateData)
      .where(eq(chapters.id, chapterId))
      .returning();

    // Save new version after update
    await saveChapterVersion(
      updatedChapter.id,
      updatedChapter.title,
      updatedChapter.content,
      updatedChapter.wordCount,
      req.user.id,
      req.user.email,
      'Chapter updated'
    );

    // Update project word count if content changed
    if (content !== undefined) {
      await updateProjectWordCount(existingChapter.projectId);
    }

    res.json(updatedChapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// DELETE /chapters/:id - Delete a chapter
router.delete('/:id', async (req, res) => {
  try {
    const chapterId = parseInt(req.params.id);

    // Get the chapter and verify ownership
    const [existingChapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!existingChapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify project access (owner or collaborator)
    const project = await verifyProjectAccess(existingChapter.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Chapter not found or access denied' });
    }

    await db.delete(chapters).where(eq(chapters.id, chapterId));

    // Update project word count
    await updateProjectWordCount(existingChapter.projectId);

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// GET /chapters/:id/versions - Get version history for a chapter
router.get('/:id/versions', async (req, res) => {
  try {
    const chapterId = parseInt(req.params.id);

    // Get the chapter and verify access
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify project access
    const project = await verifyProjectAccess(chapter.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Chapter not found or access denied' });
    }

    // Get all versions for this chapter
    const versions = await db
      .select()
      .from(chapterVersions)
      .where(eq(chapterVersions.chapterId, chapterId))
      .orderBy(desc(chapterVersions.createdAt));

    res.json(versions);
  } catch (error) {
    console.error('Error fetching chapter versions:', error);
    res.status(500).json({ error: 'Failed to fetch chapter versions' });
  }
});

// GET /chapters/:id/versions/:versionId - Get a specific version
router.get('/:id/versions/:versionId', async (req, res) => {
  try {
    const chapterId = parseInt(req.params.id);
    const versionId = parseInt(req.params.versionId);

    // Get the chapter and verify access
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify project access
    const project = await verifyProjectAccess(chapter.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Chapter not found or access denied' });
    }

    // Get the specific version
    const [version] = await db
      .select()
      .from(chapterVersions)
      .where(and(
        eq(chapterVersions.chapterId, chapterId),
        eq(chapterVersions.id, versionId)
      ))
      .limit(1);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (error) {
    console.error('Error fetching chapter version:', error);
    res.status(500).json({ error: 'Failed to fetch chapter version' });
  }
});

// POST /chapters/:id/restore/:versionId - Restore a chapter to a specific version
router.post('/:id/restore/:versionId', async (req, res) => {
  try {
    const chapterId = parseInt(req.params.id);
    const versionId = parseInt(req.params.versionId);

    // Get the chapter and verify access
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify project access
    const project = await verifyProjectAccess(chapter.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Chapter not found or access denied' });
    }

    // Get the version to restore
    const [versionToRestore] = await db
      .select()
      .from(chapterVersions)
      .where(and(
        eq(chapterVersions.chapterId, chapterId),
        eq(chapterVersions.id, versionId)
      ))
      .limit(1);

    if (!versionToRestore) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Update the chapter with the version data
    const [restoredChapter] = await db
      .update(chapters)
      .set({
        title: versionToRestore.title,
        content: versionToRestore.content,
        wordCount: versionToRestore.wordCount,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, chapterId))
      .returning();

    // Save a new version indicating this was a restore
    await saveChapterVersion(
      restoredChapter.id,
      restoredChapter.title,
      restoredChapter.content,
      restoredChapter.wordCount,
      req.user.id,
      req.user.email,
      `Restored to version ${versionToRestore.version}`
    );

    // Update project word count
    await updateProjectWordCount(chapter.projectId);

    res.json(restoredChapter);
  } catch (error) {
    console.error('Error restoring chapter version:', error);
    res.status(500).json({ error: 'Failed to restore chapter version' });
  }
});

module.exports = router;