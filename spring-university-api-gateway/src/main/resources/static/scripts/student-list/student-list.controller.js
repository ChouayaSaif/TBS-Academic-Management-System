'use strict';

angular.module('studentList')
    .controller('StudentListController', ['$http', '$state', function($http, $state) {
        var self = this;
        self.students = [];
        self.searchQuery = '';
        self.loading = true;
        self.error = null;

        self.loadStudents = function() {
            self.loading = true;
            $http.get('/api/students').then(function(response) {
                self.students = response.data;
                self.loading = false;
            }).catch(function(error) {
                self.error = 'Failed to load students';
                self.loading = false;
            });
        };

        self.searchStudents = function() {
            if (self.searchQuery && self.searchQuery.length > 0) {
                $http.get('/api/students/search?query=' + self.searchQuery).then(function(response) {
                    self.students = response.data;
                }).catch(function() {
                    self.loadStudents();
                });
            } else {
                self.loadStudents();
            }
        };

        self.viewStudent = function(studentId) {
            $state.go('studentDetails', { studentId: studentId });
        };

        self.registerCourses = function(studentId) {
            $state.go('courseRegistration', { studentId: studentId });
        };

        self.loadStudents();
    }]);

