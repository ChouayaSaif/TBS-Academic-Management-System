'use strict';

angular.module('courseList')
    .controller('CourseListController', ['$http', function($http) {
        var self = this;
        self.courses = [];
        self.loading = true;
        self.error = null;
        self.filterDepartment = '';
        self.filterDay = '';

        self.departments = [
            'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
            'Biology', 'Engineering', 'Business Administration', 'Economics'
        ];

        self.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        self.loadCourses = function() {
            self.loading = true;
            $http.get('/api/courses').then(function(response) {
                self.courses = response.data;
                self.loading = false;
            }).catch(function(error) {
                self.error = 'Failed to load courses';
                self.loading = false;
            });
        };

        self.filterCourses = function() {
            var params = [];
            if (self.filterDepartment) {
                params.push('department=' + encodeURIComponent(self.filterDepartment));
            }
            if (self.filterDay) {
                params.push('day=' + encodeURIComponent(self.filterDay));
            }
            var url = '/api/courses' + (params.length > 0 ? '?' + params.join('&') : '');

            $http.get(url).then(function(response) {
                self.courses = response.data;
            }).catch(function() {
                self.loadCourses();
            });
        };

        self.clearFilters = function() {
            self.filterDepartment = '';
            self.filterDay = '';
            self.loadCourses();
        };

        self.loadCourses();
    }]);

