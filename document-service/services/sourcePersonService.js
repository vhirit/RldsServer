const SourcePersonRepository = require('../repositories/sourcePersonRepository');

class SourcePersonService {
  constructor() {
    this.sourcePersonRepository = new SourcePersonRepository();
  }

  // Create new source person
  async createSourcePerson(sourcePersonData) {
    try {
      // Validate unique mobile
      const mobileExists = await this.sourcePersonRepository.isMobileExists(sourcePersonData.mobile);
      if (mobileExists) {
        throw new Error('Mobile number already exists');
      }

      // Validate unique email
      const emailExists = await this.sourcePersonRepository.isEmailExists(sourcePersonData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      // Validate data
      const validationErrors = this.validateSourcePersonData(sourcePersonData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Create source person
      return await this.sourcePersonRepository.createSourcePerson(sourcePersonData);
      
    } catch (error) {
      throw error;
    }
  }

  // Get all source persons
  async getAllSourcePersons(filters) {
    try {
      return await this.sourcePersonRepository.getAllSourcePersons(filters);
    } catch (error) {
      throw error;
    }
  }

  // Get source person by ID
  async getSourcePersonById(id) {
    try {
      const sourcePerson = await this.sourcePersonRepository.getSourcePersonById(id);
      if (!sourcePerson) {
        throw new Error('Source person not found');
      }
      return sourcePerson;
    } catch (error) {
      throw error;
    }
  }

  // Update source person
  async updateSourcePerson(id, updateData) {
    try {
      // Check if source person exists
      const existingPerson = await this.sourcePersonRepository.getSourcePersonById(id);
      if (!existingPerson) {
        throw new Error('Source person not found');
      }

      // Validate unique mobile if being updated
      if (updateData.mobile && updateData.mobile !== existingPerson.mobile) {
        const mobileExists = await this.sourcePersonRepository.isMobileExists(updateData.mobile, id);
        if (mobileExists) {
          throw new Error('Mobile number already exists');
        }
      }

      // Validate unique email if being updated
      if (updateData.email && updateData.email !== existingPerson.email) {
        const emailExists = await this.sourcePersonRepository.isEmailExists(updateData.email, id);
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      // Validate data
      const validationErrors = this.validateSourcePersonData(updateData, true);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      return await this.sourcePersonRepository.updateSourcePerson(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  // Delete source person
  async deleteSourcePerson(id) {
    try {
      const sourcePerson = await this.sourcePersonRepository.getSourcePersonById(id);
      if (!sourcePerson) {
        throw new Error('Source person not found');
      }
      return await this.sourcePersonRepository.deleteSourcePerson(id);
    } catch (error) {
      throw error;
    }
  }

  // Get source person statistics
  async getSourcePersonStatistics() {
    try {
      return await this.sourcePersonRepository.getSourcePersonStatistics();
    } catch (error) {
      throw error;
    }
  }

  // Validate source person data
  validateSourcePersonData(sourcePersonData, isUpdate = false) {
    const errors = [];

    // Required fields validation (for create)
    if (!isUpdate) {
      const requiredFields = ['name', 'mobile', 'email', 'city', 'state', 'county'];
      requiredFields.forEach(field => {
        if (!sourcePersonData[field]) {
          errors.push(`${field} is required`);
        }
      });
    }

    // Mobile validation
    if (sourcePersonData.mobile) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(sourcePersonData.mobile)) {
        errors.push('Mobile number must be 10 digits');
      }
    }

    // Email validation
    if (sourcePersonData.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(sourcePersonData.email)) {
        errors.push('Invalid email format');
      }
    }

    return errors;
  }
}

module.exports = SourcePersonService;