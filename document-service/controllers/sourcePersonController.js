const SourcePersonService = require('../services/sourcePersonService');

class SourcePersonController {
  constructor() {
    this.sourcePersonService = new SourcePersonService();
  }

  // Create new source person
  createSourcePerson = async (req, res) => {
    try {
      console.log('👤 Creating new source person with data:', req.body);
      
      const sourcePersonData = {
        ...req.body,
        status: req.body.status || 'Active'
      };

      const newSourcePerson = await this.sourcePersonService.createSourcePerson(sourcePersonData);
      
      console.log('✅ Source person created successfully:', newSourcePerson.name);
      
      // 🔥 IMMEDIATE WebSocket broadcast to all connected clients
      if (req.app.locals.io) {
        req.app.locals.io.emit('newSourcePersonAdded', { 
          sourcePerson: newSourcePerson,
          timestamp: new Date().toISOString(),
          message: `New source person ${newSourcePerson.name} added successfully`
        });
        console.log('📡 Broadcasted newSourcePersonAdded event to all clients');
      }

      res.status(201).json({
        success: true,
        message: 'Source person created successfully',
        data: newSourcePerson
      });
    } catch (error) {
      console.error('❌ Error creating source person:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          errors: [`${field} must be unique`]
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      if (error.message.includes('already exists') || error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get all source persons with pagination
  getAllSourcePersons = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', status = '', city = '', state = '' } = req.query;
      
      console.log(`📋 Fetching source persons - Page: ${page}, Limit: ${limit}, Search: "${search}"`);
      
      const result = await this.sourcePersonService.getAllSourcePersons({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        city,
        state
      });

      console.log(`📋 Found ${result.data.length} source persons out of ${result.pagination.totalItems} total`);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('❌ Error fetching source persons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch source persons',
        error: error.message
      });
    }
  };

  // Get single source person by ID
  getSourcePersonById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('📋 Fetching source person by ID:', id);
      
      const sourcePerson = await this.sourcePersonService.getSourcePersonById(id);
      
      if (!sourcePerson) {
        return res.status(404).json({
          success: false,
          message: 'Source person not found'
        });
      }

      console.log('✅ Source person found:', sourcePerson.name);

      res.json({
        success: true,
        data: sourcePerson
      });
    } catch (error) {
      console.error('❌ Error fetching source person:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch source person',
        error: error.message
      });
    }
  };

  // Update source person
  updateSourcePerson = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔄 Updating source person:', id, 'with data:', req.body);

      const updatedSourcePerson = await this.sourcePersonService.updateSourcePerson(id, req.body);
      
      if (!updatedSourcePerson) {
        return res.status(404).json({
          success: false,
          message: 'Source person not found'
        });
      }

      console.log('✅ Source person updated successfully:', updatedSourcePerson.name);
      
      // 🔥 WebSocket broadcast for update
      if (req.app.locals.io) {
        req.app.locals.io.emit('sourcePersonUpdated', { 
          sourcePerson: updatedSourcePerson,
          timestamp: new Date().toISOString(),
          message: `Source person ${updatedSourcePerson.name} updated successfully`
        });
        console.log('📡 Broadcasted sourcePersonUpdated event');
      }

      res.json({
        success: true,
        message: 'Source person updated successfully',
        data: updatedSourcePerson
      });
    } catch (error) {
      console.error('❌ Error updating source person:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          errors: [`${field} must be unique`]
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      if (error.message.includes('already exists') || error.message.includes('not found')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update source person',
        error: error.message
      });
    }
  };

  // Delete source person
  deleteSourcePerson = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🗑️ Deleting source person:', id);
      
      const deletedSourcePerson = await this.sourcePersonService.deleteSourcePerson(id);
      
      if (!deletedSourcePerson) {
        return res.status(404).json({
          success: false,
          message: 'Source person not found'
        });
      }

      console.log('✅ Source person deleted successfully:', deletedSourcePerson.name);
      
      // 🔥 WebSocket broadcast for deletion
      if (req.app.locals.io) {
        req.app.locals.io.emit('sourcePersonDeleted', { 
          sourcePersonId: id,
          sourcePersonName: deletedSourcePerson.name,
          timestamp: new Date().toISOString(),
          message: `Source person ${deletedSourcePerson.name} deleted successfully`
        });
        console.log('📡 Broadcasted sourcePersonDeleted event');
      }

      res.json({
        success: true,
        message: 'Source person deleted successfully',
        data: {
          id: deletedSourcePerson._id,
          name: deletedSourcePerson.name
        }
      });
    } catch (error) {
      console.error('❌ Error deleting source person:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete source person',
        error: error.message
      });
    }
  };

  // Get source person statistics
  getSourcePersonStatistics = async (req, res) => {
    try {
      console.log('📊 Fetching source person statistics');
      
      const stats = await this.sourcePersonService.getSourcePersonStatistics();
      
      console.log('📊 Source Person Statistics:', stats);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error fetching source person statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  };
}

module.exports = new SourcePersonController();