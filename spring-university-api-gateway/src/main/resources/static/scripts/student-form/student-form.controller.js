'use strict';

angular.module('studentForm')
    .controller('StudentFormController', ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
        var self = this;
        self.student = {
            firstName: '',
            lastName: '',
            studentId: '',
            email: '',
            department: ''
        };
        self.isEdit = false;
        self.loading = false;
        self.error = null;
        self.success = null;

        self.departments = [
            'Computer Science',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'Engineering',
            'Business Administration',
            'Economics',
            'Psychology',
            'Literature'
        ];

        self.init = function() {
            if ($stateParams.studentId) {
                self.isEdit = true;
                self.loading = true;
                $http.get('/api/students/' + $stateParams.studentId).then(function(response) {
                    self.student = response.data;
                    self.loading = false;
                }).catch(function(error) {
                    self.error = 'Failed to load student data';
                    self.loading = false;
                });
            }
        };

        self.submitForm = function() {
            self.error = null;
            self.success = null;
            self.loading = true;

            if (self.isEdit) {
                $http.put('/api/students/' + $stateParams.studentId, self.student).then(function(response) {
                    self.success = 'Student updated successfully!';
                    self.loading = false;
                    setTimeout(function() {
                        $state.go('studentDetails', { studentId: $stateParams.studentId });
                    }, 1500);
                }).catch(function(error) {
                    self.error = 'Failed to update student: ' + (error.data.message || 'Unknown error');
                    self.loading = false;
                });
            } else {
                $http.post('/api/students', self.student).then(function(response) {
                    self.success = 'Student registered successfully!';
                    self.loading = false;
                    setTimeout(function() {
                        $state.go('studentDetails', { studentId: response.data.id });
                    }, 1500);
                }).catch(function(error) {
                    self.error = 'Failed to register student: ' + (error.data.message || 'Unknown error');
                    self.loading = false;
                });
            }
        };

        self.cancel = function() {
            $state.go('students');
        };

        self.init();
    }]);

