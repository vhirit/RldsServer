const SourcePerson = require('../models/sourcePersonModel');

class SourcePersonRepository {
  // Create new source person
  async createSourcePerson(sourcePersonData) {
    try {
      const sourcePerson = new SourcePerson(sourcePersonData);
      return await sourcePerson.save();
    } catch (error) {
      throw error;
    }
  }

  // Get all source persons with pagination and filtering
  async getAllSourcePersons({ page = 1, limit = 10, search = '', status = '', city = '', state = '' }) {
    try {
      const query = {};
      
      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { county: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Status filter
      if (status) {
        query.status = status;
      }

      // City filter
      if (city) {
        query.city = { $regex: city, $options: 'i' };
      }

      // State filter
      if (state) {
        query.state = { $regex: state, $options: 'i' };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        collation: { locale: 'en', strength: 2 }
      };

      const result = await SourcePerson.paginate(query, options);
      
      // Transform the mongoose-paginate-v2 result to match expected structure
      return {
        data: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.totalDocs,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage,
          itemsPerPage: result.limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get source person by ID
  async getSourcePersonById(id) {
    try {
      return await SourcePerson.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Get source person by mobile
  async getSourcePersonByMobile(mobile) {
    try {
      return await SourcePerson.findOne({ mobile });
    } catch (error) {
      throw error;
    }
  }

  // Get source person by email
  async getSourcePersonByEmail(email) {
    try {
      return await SourcePerson.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw error;
    }
  }

  // Update source person
  async updateSourcePerson(id, updateData) {
    try {
      return await SourcePerson.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete source person
  async deleteSourcePerson(id) {
    try {
      return await SourcePerson.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Get source person statistics
  async getSourcePersonStatistics() {
    try {
      const stats = await SourcePerson.aggregate([
        {
          $group: {
            _id: null,
            totalPersons: { $sum: 1 },
            activePersons: {
              $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
            },
            totalCities: { $addToSet: '$city' },
            totalStates: { $addToSet: '$state' }
          }
        },
        {
          $project: {
            totalPersons: 1,
            activePersons: 1,
            totalCities: { $size: '$totalCities' },
            totalStates: { $size: '$totalStates' }
          }
        }
      ]);

      return stats[0] || {
        totalPersons: 0,
        activePersons: 0,
        totalCities: 0,
        totalStates: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if mobile exists
  async isMobileExists(mobile, excludeId = null) {
    try {
      return await SourcePerson.isMobileExists(mobile, excludeId);
    } catch (error) {
      throw error;
    }
  }

  // Check if email exists
  async isEmailExists(email, excludeId = null) {
    try {
      return await SourcePerson.isEmailExists(email, excludeId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SourcePersonRepository;