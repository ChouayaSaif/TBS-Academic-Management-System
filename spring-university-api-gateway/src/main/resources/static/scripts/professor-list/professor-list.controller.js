'use strict';

angular.module('professorList')
    .controller('ProfessorListController', ['$http', function($http) {
        var self = this;
        self.professors = [];
        self.loading = true;
        self.error = null;
        self.filterSpecialty = '';

        self.loadProfessors = function() {
            self.loading = true;
            $http.get('/api/professors').then(function(response) {
                self.professors = response.data;
                self.loading = false;
            }).catch(function(error) {
                self.error = 'Failed to load professors';
                self.loading = false;
            });
        };

        self.getSpecialties = function() {
            var specialties = [];
            self.professors.forEach(function(prof) {
                if (prof.specialties) {
                    prof.specialties.forEach(function(spec) {
                        if (specialties.indexOf(spec.name) === -1) {
                            specialties.push(spec.name);
                        }
                    });
                }
            });
            return specialties.sort();
        };

        self.getFilteredProfessors = function() {
            if (!self.filterSpecialty) {
                return self.professors;
            }
            return self.professors.filter(function(prof) {
                return prof.specialties && prof.specialties.some(function(spec) {
                    return spec.name === self.filterSpecialty;
                });
            });
        };

        self.loadProfessors();
    }]);

